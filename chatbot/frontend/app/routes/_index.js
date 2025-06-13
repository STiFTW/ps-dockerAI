import Chat from "~/components/Chat";
import { getConfig } from "~/config.server";
import { useLoaderData } from "@remix-run/react";

export const meta = () => {
  return [
    { title: "AI Chatbot on DMR" },
    { description: "AI Chatbot on Docker Model Runner" }
  ];
};

export const loader = () => {
  const config = getConfig();
  return {
    defaultModelName: config.LLM_MODEL_NAME
  };
};

export default function Index() {
  const { defaultModelName } = useLoaderData();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="py-3 bg-white shadow fixed top-0 left-0 right-0 z-20">
        <h1 className="text-xl md:text-2xl font-bold text-center">
          AI Chatbot on Docker Model Runner
        </h1>
        <p className="text-center text-sm text-gray-500 mt-1">
          Using model: <span className="font-medium">{defaultModelName}</span>
        </p>
      </header>
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-14 pb-2 flex flex-col">
        <Chat />
      </main>
    </div>
  );
}