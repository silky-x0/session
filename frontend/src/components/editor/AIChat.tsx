import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  editorRef: React.MutableRefObject<any>;
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

export function AIChat({ editorRef }: AIChatProps) {
  const roomId = new URLSearchParams(window.location.search).get("room") || "default";
  const storageKey = `ai-chat-messages-${roomId}`;

  const [messages, setMessages] = useState<Message[]>(() => {
    // Load messages from localStorage on initial render
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [DEFAULT_MESSAGE];
      }
    }
    return [DEFAULT_MESSAGE];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

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
    };

    setMessages((prev) => [...prev, userMessage]);
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
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="h-full flex flex-col glass-panel rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-card/50">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Ask Kernel</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex gap-2 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === "assistant"
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {message.role === "assistant" ? (
                  <Bot className="w-3.5 h-3.5" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
              </div>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                  message.role === "assistant"
                    ? "bg-card text-foreground border border-border"
                    : "bg-primary/20 text-foreground border border-primary/30"
                }`}
              >
                {message.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 items-center"
          >
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="flex gap-1 px-3 py-2 bg-card rounded-lg border border-border">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary"
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
      <div className="p-1 border-t border-border bg-card/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask Kernel anything..."
            className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
          <motion.button
            onClick={handleSend}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!input.trim()}
            className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
