from bs4 import BeautifulSoup
import requests
from langchain.document_loaders import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Pinecone
import os
import pinecone

os.environ["OPENAI_API_KEY"] = """
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
"""
PINECONE_API_KEY = "0ec1d2e6-afd5-45ec-a8d3-804ce883d97a"
PINECONE_ENV = "northamerica-northeast1-gcp"

index_name = "viam"
embeddings = OpenAIEmbeddings()


def get_all_urls():
    """Get all internal and external URLs from the VIAM docs website."""

    viam_url = 'https://docs.viam.com'
    response = requests.get(viam_url, timeout=5)

    soup = BeautifulSoup(response.content, 'html.parser')

    a_tags = soup.find_all('a', href=True)

    internal_urls = set()
    external_urls = set()

    for tag in a_tags:
        url = tag['href']
        if 'mailto' in url or '#' in url:
            continue
        elif url.startswith('https://'):
            external_urls.add(url)
        elif url.startswith('/'):
            internal_urls.add("https://docs.viam.com" + url)
        else:
            internal_urls.add("https://docs.viam.com/" + url)

    return internal_urls, external_urls


def create_embeddings():
    """Create embeddings for all documents on the VIAM docs website."""
    internal_urls, external_urls = get_all_urls()
    internal_urls = list(internal_urls)
    print('Loading documents...')
    loader = WebBaseLoader(internal_urls)
    docs = loader.load()
    print('Splitting documents...')
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    texts = text_splitter.split_documents(docs)
    print('Creating embeddings...')
    pinecone.init(
        api_key=PINECONE_API_KEY,
        environment=PINECONE_ENV,
    )
    print('Uploading embeddings to Pinecone...')
    vectorstore = Pinecone.from_documents(
        texts, embeddings, index_name=index_name
    )
    return vectorstore


UPLOAD = True

if UPLOAD:
    vectorstore = create_embeddings()
else:
    vectorstore = Pinecone.from_existing_index(index_name, embeddings)
