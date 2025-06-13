import { useState, useRef, useEffect } from "react";
import { Form, useNavigation, useLoaderData } from "@remix-run/react";

export default function Chat() {
  const { defaultModelName } = useLoaderData();
  const [messages, setMessages] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [modelName, setModelName] = useState(defaultModelName || ""); 
  const navigation = useNavigation();
  const formRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const initialFocusRef = useRef(false);

  // Focus the textarea on initial load and when streaming ends
  useEffect(() => {
    // Focus on initial load
    if (!initialFocusRef.current && textareaRef.current) {
      textareaRef.current.focus();
      initialFocusRef.current = true;
    }
    
    // Focus when streaming ends
    if (!isStreaming && textareaRef.current && messages.length > 0) {
      textareaRef.current.focus();
    }
  }, [isStreaming, messages.length]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const userMessage = formData.get("message");
    
    if (!userMessage?.trim()) return;
    
    const newUserMessage = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);
    formRef.current?.reset();
    
    setIsWaiting(true);
    setIsStreaming(true);
    
    try {
      const response = await fetch("/api/v1/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [...messages, newUserMessage],
          temperature: 0.7,
          stream: true,
          model: modelName // Pass the model name from state
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let currentMessage = "";
      
      if (!reader) return;
      
      let firstChunkReceived = false;
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          if (currentMessage.trim()) {
            // Trim the current message to remove any leading/trailing whitespace
            setMessages((prev) => [...prev, { role: "assistant", content: currentMessage.trim() }]);
          }
          setStreamingMessage("");
          setIsStreaming(false);
          break;
        }
        
        if (!firstChunkReceived) {
          setIsWaiting(false);
          firstChunkReceived = true;
        }
        
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (!line.trim() || !line.startsWith("data:")) continue;
          
          const data = line.slice(5).trim();
          if (data === "[DONE]") continue;
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.message?.content) {
              // For the first content chunk, trim any leading whitespace
              if (currentMessage === "") {
                currentMessage += parsed.message.content.trimStart();
              } else {
                currentMessage += parsed.message.content;
              }
              setStreamingMessage(currentMessage);
            }
            if (parsed.model && modelName !== parsed.model) {
              setModelName(parsed.model);
            }
          } catch (e) {
            console.error("Failed to parse chunk:", e);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setStreamingMessage("Error: Failed to get response");
      setIsWaiting(false);
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const form = formRef.current;
      if (form) {
        const textarea = form.querySelector("textarea");
        if (textarea?.value.trim()) {
          form.requestSubmit();
        }
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  // Helper function to render message content without leading/trailing whitespace
  const renderMessageContent = (content) => {
    return content.trim();
  };

  return (
    // Main container with fixed height
    <div className="flex flex-col h-full min-h-[calc(100vh-120px)]">
      {/* Messages container with scrolling */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === "user" ? "bg-pinkBrand text-white" : "bg-gray-100 text-gray-900"
              }`}
            >
              <div className="whitespace-pre-wrap">{renderMessageContent(message.content)}</div>
            </div>
          </div>
        ))}
        
        {isWaiting && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-gray-100 text-gray-900">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
        
        {streamingMessage && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-gray-100 text-gray-900">
              <div className="whitespace-pre-wrap">{streamingMessage}</div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef}></div>
      </div>
      
      {/* Input area - fixed at bottom */}
      <div className="border-t p-3 bg-white sticky bottom-0 left-0 right-0 z-10 shadow-md">
        <Form ref={formRef} onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              name="message"
              rows={1}
              className="flex-1 rounded-xl border-gray-200 shadow-sm focus:border-[#FF1675] focus:ring-[#FF1675] sm:text-sm py-2.5"
              placeholder="Type your message..."
              disabled={navigation.state === "submitting" || isStreaming}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{ overflow: 'hidden', minHeight: '40px' }}
            />
            
            <button
              type="submit"
              disabled={navigation.state === "submitting" || isStreaming}
              className="px-4 py-2 bg-pinkBrand text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {isStreaming ? "Thinking..." : navigation.state === "submitting" ? "Sending..." : "Send"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}