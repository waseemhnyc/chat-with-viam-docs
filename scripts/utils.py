from bs4 import BeautifulSoup
import requests


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
