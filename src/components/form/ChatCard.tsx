'use client';

import { Bot, FileText, LucideSend, Paperclip, SkipForward, Trash2, ExternalLink } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { chatApi, SourceDocument, HistoryMessage } from "../../api/chatApi";
import { API_SERVER } from "../../helpers/api";

type Message = {
  id: number;
  sender: "user" | "admin";
  text?: string;
  file?: File;
  fileUrl?: string;
  fileName?: string;
  time?: string;
  document_id?: number;
  source_documents?: SourceDocument[];
};

interface ChatCardProps {
  title?: string;
  messages?: Message[];
}

export default function ChatCard({
  title = "MOGE AI Assistant",
  messages = [],
}: ChatCardProps) {
  const [chat, setChat] = useState<Message[]>(messages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const skipRef = useRef(false);
  const [isTextTyping, setIsTextTyping] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, isTyping]);

  const getMediaUrl = (url?: string) => {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;

    const base = API_SERVER || `${window.location.protocol}//${window.location.hostname}:8000`;
    const cleanBase = base.replace(/\/$/, "");
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${cleanBase}${cleanUrl}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setDocumentId(null);
      setIsUploading(true);

      try {
        const response = await chatApi.uploadDocument(selectedFile);
        if (response.document_id) {
          setDocumentId(response.document_id);
        }
      } catch (error) {
        console.error("Upload failed", error);
        setFile(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !file) || isUploading) return;

    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: input,
      file: file || undefined,
      fileUrl: file ? URL.createObjectURL(file) : undefined,
      fileName: file?.name,
      time: new Date().toLocaleTimeString(),
      document_id: documentId || undefined,
    };

    // Extract recent session history (last 10 messages)
    const historyPayload: HistoryMessage[] = chat
      .slice(-10)
      .map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text || "",
      }))
      .filter((h) => h.content.trim() !== "");

    setChat((prev) => [...prev, userMsg]);
    setInput("");
    setFile(null);
    setDocumentId(null);

    setIsTyping(true);

    try {
      const payload = {
        text: userMsg.text || "",
        document_id: userMsg.document_id,
        history: historyPayload,
      };

      const ai_message = await chatApi.send(payload);
      const botId = Date.now() + 1;

      // Create EMPTY bot message first
      setChat((prev) => [
        ...prev,
        {
          id: botId,
          sender: "admin",
          text: "",
          time: new Date().toLocaleTimeString(),
          source_documents: ai_message.source_documents || [],
        },
      ]);

      const fullText = ai_message.response || "No response received";
      if (fullText) {
        setIsTyping(false);
      }
      setIsTextTyping(true);

      // Typing animation
      typeText(fullText, (typedText, isDone) => {
        setChat((prev) =>
          prev.map((msg) =>
            msg.id === botId ? { ...msg, text: typedText } : msg
          )
        );
        if (isDone) {
          setIsTyping(false);
        }
      });

    } catch (error) {
      setIsTyping(false);

      setChat((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "admin",
          text: "Error: Unable to connect to AI server.",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  const typeText = (fullText: string, callback: (text: string, done?: boolean) => void) => {
    let index = 0;

    const interval = setInterval(() => {
      callback(fullText.slice(0, index + 1));
      index++;

      if (skipRef.current) {
        clearInterval(interval);
        skipRef.current = false;
        callback(fullText, true);
        setIsTextTyping(false);
        setIsTyping(false);
        return;
      }

      if (index >= fullText.length) {
        clearInterval(interval);
        setIsTextTyping(false);
      }
    }, 15);
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-gray-900 shadow-sm flex flex-col h-[650px]">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center overflow-hidden">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
              {title}
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Powered by Gemini & LangChain RAG
            </p>
          </div>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar">
        {chat.map((msg) => {
          const isUser = msg.sender === "user";

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {/* Bot Avatar */}
              {!isUser && (
                <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={18} />
                </div>
              )}

              {/* Message Content Bubble */}
              <div className={`max-w-[80%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                      : "bg-gray-100 dark:bg-white/[0.05] text-gray-800 dark:text-white/90 rounded-bl-none border border-gray-200/50 dark:border-white/5"
                  }`}
                >
                  {/* Text Response */}
                  {msg.text && <div className="whitespace-pre-wrap">{msg.text}</div>}

                  {/* Attached user file */}
                  {msg.fileUrl && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                      {msg.file?.type.startsWith("image/") ? (
                        <img src={getMediaUrl(msg.fileUrl)} alt="Uploaded attachment" className="rounded-lg max-w-full max-h-40" />
                      ) : (
                        <a href={getMediaUrl(msg.fileUrl)} target="_blank" rel="noreferrer" className="underline text-xs flex items-center gap-1">
                          📄 {msg.fileName}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Source Documents Section (RAG Citations) */}
                  {!isUser && msg.source_documents && msg.source_documents.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10 flex flex-col gap-2">
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                        <FileText size={14} className="text-blue-500" />
                        Source Documents ({msg.source_documents.length}):
                      </div>
                      <div className="grid grid-cols-1 gap-2 mt-1">
                        {msg.source_documents.map((doc, idx) => (
                          <div
                            key={idx}
                            className="bg-white dark:bg-gray-800/80 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700/60 shadow-xs hover:border-blue-300 dark:hover:border-blue-600 transition"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-xs text-blue-600 dark:text-blue-400 truncate flex items-center gap-1">
                                <FileText size={13} />
                                {doc.file_name}
                                {doc.page && <span className="text-[10px] text-gray-500 font-normal">(p. {doc.page})</span>}
                              </span>
                              {doc.file_url && (
                                <a
                                  href={getMediaUrl(doc.file_url)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-0.5"
                                  title="View document file"
                                >
                                  View <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                            {doc.snippet && (
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 italic bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded border border-gray-100 dark:border-gray-800">
                                "{doc.snippet}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  {msg.time && (
                    <div className="text-[10px] mt-1.5 text-right opacity-60">
                      {msg.time}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />

        {/* Loading Indicator */}
        {isTyping && (
          <div className="flex items-end gap-3 justify-start">
            <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-white/[0.05] border border-gray-200/50 dark:border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:150ms]"></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:300ms]"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-gray-100 dark:border-white/[0.05] flex flex-col gap-2">

        {/* File upload preview badge */}
        {file && (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm border border-blue-100 dark:border-blue-800">
            <span className="flex items-center gap-2 text-blue-700 dark:text-blue-300 truncate font-medium text-xs">
              <Paperclip size={14} />
              {file.name}
              {isUploading && (
                <span className="ml-2 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                  <span className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
                  Indexing PDF/Document...
                </span>
              )}
            </span>

            <button
              onClick={() => { setFile(null); setDocumentId(null); }}
              disabled={isUploading}
              className={`p-1 text-white rounded-md transition ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
              title="Remove file"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="flex gap-2 items-center">
          <label className="cursor-pointer p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition flex items-center justify-center">
            <Paperclip size={18} />
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileChange}
            />
          </label>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask about staff members, documents (e.g. tin dar), or general questions..."
            className="flex-1 rounded-lg border px-3 py-2.5 text-sm bg-transparent text-gray-800 dark:text-white/90 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />

          <div className="flex gap-1.5">
            {isTextTyping && (
              <button
                onClick={() => { skipRef.current = true; }}
                className="p-2.5 rounded-lg bg-gray-100 dark:bg-white/[0.05] hover:bg-gray-200 text-gray-700 dark:text-gray-300 transition"
                title="Skip typing"
              >
                <SkipForward size={18} />
              </button>
            )}

            <button
              onClick={sendMessage}
              disabled={isUploading}
              className={`p-2.5 rounded-lg text-white font-medium transition ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-sm'}`}
              title="Send message"
            >
              <LucideSend size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}