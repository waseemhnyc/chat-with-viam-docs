import { LangChainStream } from "@/lib/LangChainStream";
import { PineconeClient } from "@pinecone-database/pinecone";
import { StreamingTextResponse } from "ai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
// import { RetrievalQAChain, loadQARefineChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import {
  AIChatMessage,
  HumanChatMessage,
  SystemChatMessage,
} from "langchain/schema";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import z from "zod";

const ChatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string(),
      id: z.string().optional(),
      createdAt: z.date().optional(),
    })
  ),
});

const template = `
You are an AI assistant that has conversations and help answer questions about Viam Robotics, Robotics and Electronics.
Provide a conversational answer/response. The documentation for Viam Robotics is located at https://docs.viam.com/.
You are given the following extracted parts of a long document and a question.
Provide hyperlinks to the documentation.
You should only use hyperlinks that are explicitly listed as a source in the context. Do NOT make up a hyperlink that is not listed.
If the question includes a request for code, provide a code block directly from the documentation.
If you don't know the answer, just say "Hmm, I'm not sure." Don't try to make up an answer.
If the question is not about Viam Robotics, Robotics or Electronics, politely inform them that you are tuned to only answer questions about Viam and Robotics.
If the question is a statement, reply back accordingly.


Question: {question}
=========
{context}
=========
Answer:`

const prompt = PromptTemplate.fromTemplate(
  template
);

export const runtime = "edge";

let pinecone: PineconeClient | null = null;

const initPineconeClient = async () => {
  pinecone = new PineconeClient();
  await pinecone.init({
    apiKey: process.env.PINECONE_API_KEY!,
    environment: process.env.PINECONE_ENVIRONMENT!,
  });
};

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const { messages } = ChatSchema.parse(body);

    if (pinecone == null) {
      await initPineconeClient();
    }

    const pineconeIndex = pinecone!.Index(process.env.PINECONE_INDEX_NAME!);

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex }
    );

    const pastMessages = messages.map((m) => {
      if (m.role === "user") {
        return new HumanChatMessage(m.content);
      }
      if (m.role === "system") {
        return new SystemChatMessage(m.content);
      }
      return new AIChatMessage(m.content);
    });

    const { stream, handlers } = LangChainStream();

    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4",
      streaming: true,
    });

    const nonStreamingModel = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4"
    });

    const chain = ConversationalRetrievalQAChain.fromLLM(
      model,
      vectorStore.asRetriever(),
      {
        qaChainOptions: {
          type: "stuff",
          prompt: prompt
        },
        questionGeneratorChainOptions: {
          llm: nonStreamingModel
        },
      }
    );

    const question = messages[messages.length - 1].content;

    chain
      .call(
        {
          question,
          chat_history: pastMessages,
        },
        [handlers]
      )
      .catch(console.error);

    return new StreamingTextResponse(stream);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 });
    }

    return new Response(null, { status: 500 });
  }
}