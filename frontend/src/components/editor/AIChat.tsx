import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "../ThemeContext";
import { useUpdateMyPresence, useSelf } from "@liveblocks/react/suspense";
import * as Y from "yjs";


interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  senderName?: string;
}

interface AIChatProps {
  editorRef: React.MutableRefObject<any>;
  yChat: Y.Array<any> | null;
}

function getCodeContext(editor: any, linesAbove: number = 10, linesBelow: number = 10): { code: string; cursorLine: number } | null {
  if (!editor) return null;

  const model = editor.getModel();
  if (!model) return null;

  const position = editor.getPosition();
  if (!position) return null;

  const cursorLine = position.lineNumber;
  const totalLines = model.getLineCount();

  const startLine = Math.max(1, cursorLine - linesAbove);
  const endLine = Math.min(totalLines, cursorLine + linesBelow);

  const range = {
    startLineNumber: startLine,
    startColumn: 1,
    endLineNumber: endLine,
    endColumn: model.getLineMaxColumn(endLine)
  };

  const code = model.getValueInRange(range);

  // Add line numbers and cursor marker
  const linesWithNumbers = code.split('\n').map((line: string, index: number) => {
    const lineNum = startLine + index;
    if (lineNum === cursorLine) {
      return `${lineNum}: ${line}  // <-- cursor here`;
    }
    return `${lineNum}: ${line}`;
  }).join('\n');

  return {
    code: linesWithNumbers,
    cursorLine
  };
}

const DEFAULT_MESSAGE: Message = {
  id: "1",
  role: "assistant",
  content: "Hi! I'm Kernel, your AI coding assistant. Ask me anything about your code or programming concepts. I can see the code around your cursor!",
};

export function AIChat({ editorRef, yChat }: AIChatProps) {
  const { theme } = useTheme();
  const updateMyPresence = useUpdateMyPresence();
  const self = useSelf();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync messages with Yjs yChat
  useEffect(() => {
    if (!yChat) return;

    const handleSync = () => {
      setMessages(yChat.toArray());
    };

    yChat.observe(handleSync);
    handleSync();

    return () => {
      yChat.unobserve(handleSync);
    };
  }, [yChat]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      senderName: self.presence?.info?.name || "Anonymous",
    };

    yChat?.push([userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Extract code context (10 lines above and below cursor)
      const codeContext = getCodeContext(editorRef.current, 10, 10);

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      
      const response = await fetch(`${apiUrl}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: input,
          codeContext: codeContext?.code,
          cursorLine: codeContext?.cursorLine,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I couldn't generate a response. Please try again.",
        senderName: "Kernel AI",
      };
      yChat?.push([aiMessage]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        senderName: "Kernel AI",
      };
      yChat?.push([errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const displayedMessages = messages.length > 0 ? messages : [DEFAULT_MESSAGE];

  return (
    <motion.div
      id="chat-panel"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="h-full p-1.5 bg-glass-border/10 border border-glass-border/40 rounded-3xl shadow-xl backdrop-blur-sm flex flex-col"
      onMouseEnter={() => updateMyPresence({ hoveredPanel: "chat" })}
      onMouseLeave={() => updateMyPresence({ hoveredPanel: null })}
    >
      <div className="w-full h-full bg-card rounded-[calc(1.5rem-6px)] overflow-hidden border border-glass-border/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-glass-border/15 bg-card/60">
          <Bot strokeWidth={1.2} className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] font-bold text-foreground uppercase tracking-widest font-condensed">Kernel AI</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 scrollbar-thin bg-transparent">
          <AnimatePresence>
            {displayedMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex gap-2.5 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === "assistant"
                      ? "bg-foreground/10 text-foreground border border-glass-border/30"
                      : "bg-secondary text-muted-foreground border border-glass-border/40"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <Bot strokeWidth={1.5} className="w-3.5 h-3.5" />
                  ) : (
                    <User strokeWidth={1.5} className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className={`flex flex-col gap-0.5 max-w-[85%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                  <span className="text-[9px] text-muted-foreground/60 px-1 font-mono font-medium">
                    {message.role === "assistant" ? "Kernel AI" : (message.senderName || "Anonymous")}
                  </span>
                  <div
                    className={`w-full px-1.5 py-0.5 rounded-2xl text-[11px] leading-normal shadow-sm ${
                      message.role === "assistant"
                        ? "bg-secondary/40 text-foreground border border-glass-border/30 rounded-tl-sm"
                        : "bg-foreground/5 text-foreground border border-glass-border/30 rounded-tr-sm"
                    }`}
                  >
                    <div className={`max-w-none text-[11px] leading-normal`}>
                      <ReactMarkdown
                        components={{
                          code({ className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || "");
                            const isBlock = !props.inline && match;
                            return isBlock ? (
                              <SyntaxHighlighter
                                style={theme === "light" ? prism : vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-lg text-[9px] my-1.5 border border-glass-border/20 shadow-sm"
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            ) : (
                              <code className="bg-black/35 px-1 py-0.5 rounded text-foreground text-[10px] font-mono border border-glass-border/20" {...props}>
                                {children}
                              </code>
                            );
                          },
                          p({ children }) { return <p className="mb-1 last:mb-0 text-[11px]">{children}</p>; },
                          ul({ children }) { return <ul className="list-disc list-inside mb-1 space-y-0.5 text-[11px]">{children}</ul>; },
                          ol({ children }) { return <ol className="list-decimal list-inside mb-1 space-y-0.5 text-[11px]">{children}</ol>; },
                          li({ children }) { return <li className="text-[11px]">{children}</li>; },
                          strong({ children }) { return <strong className="font-semibold text-foreground">{children}</strong>; },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2.5 items-center"
            >
              <div className="w-6 h-6 rounded-full bg-foreground/10 text-foreground flex items-center justify-center border border-glass-border/30">
                <Bot strokeWidth={1.5} className="w-3.5 h-3.5" />
              </div>
              <div className="flex gap-1 px-3 py-2 bg-secondary/40 rounded-2xl border border-glass-border/30">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-foreground/60"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-2 border-t border-glass-border/10 bg-secondary/20">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Message Kernel..."
              className="flex-1 px-3 py-2 rounded-xl bg-card border border-glass-border/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 focus:border-foreground/30 transition-all"
            />
            <motion.button
              onClick={handleSend}
              whileHover={input.trim() ? { scale: 1.05 } : {}}
              whileTap={input.trim() ? { scale: 0.95 } : {}}
              disabled={!input.trim()}
              className="p-2 rounded-xl bg-neon-pulse text-black hover:bg-neon-pulse/90 hover:shadow-[0_0_8px_rgba(0,255,65,0.3)] disabled:bg-secondary disabled:text-muted-foreground disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer"
            >
              <Send strokeWidth={1.5} className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
