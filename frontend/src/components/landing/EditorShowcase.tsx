import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type FileData = {
  name: string;
  language: string;
  code: string;
};

const FILES: FileData[] = [
  {
    name: "index.ts",
    language: "typescript",
    code: `import express from "express"
import { router } from "./router"
import { connectDB } from "./db"

const app = express()
app.use(express.json())
app.use("/api", router)

connectDB().then(() => app.listen(3000))`,
  },
  {
    name: "router.ts",
    language: "typescript",
    code: `import { Router } from "express"
import { authenticate } from "./auth"

export const router = Router()

router.get("/health", (req, res) => {
    res.json({ status: "ok" })
})

router.post("/sessions", authenticate, async (req, res) => {
    const session = await Session.create(req.body)
    res.status(201).json(session)
})`,
  },
  {
    name: "auth.ts",
    language: "typescript",
    code: `import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

const SECRET = process.env.JWT_SECRET!

export function authenticate(
    req: Request, res: Response, next: NextFunction
) {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) return res.status(401).end()

    req.user = jwt.verify(token, SECRET)
    next()
}`,
  },
  {
    name: "db.ts",
    language: "typescript",
    code: `import { Pool } from "pg"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
})

export async function connectDB() {
    await pool.connect()
    console.log("Database connected")
}

export const query = (sql: string, params?: unknown[]) =>
    pool.query(sql, params).then(r => r.rows)`,
  },
  {
    name: "tsconfig.json",
    language: "json",
    code: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}`,
  },
];

const editorTheme: { [key: string]: React.CSSProperties } = {
  ...vscDarkPlus,
  'pre[class*="language-"]': {
    ...(vscDarkPlus['pre[class*="language-"]'] as React.CSSProperties),
    background: "transparent",
    margin: 0,
    padding: 0,
    fontSize: "inherit",
    lineHeight: "inherit",
  },
  'code[class*="language-"]': {
    ...(vscDarkPlus['code[class*="language-"]'] as React.CSSProperties),
    background: "transparent",
    fontSize: "inherit",
    lineHeight: "inherit",
  },
};

export const EditorShowcase: React.FC = () => {
  const [activeFile, setActiveFile] = useState(0);
  const currentFile = FILES[activeFile];

  return (
    <section className="relative w-full px-3 sm:px-4 pt-16 sm:pt-24 md:pt-32 pb-10 sm:pb-16 flex flex-col items-center bg-[#050505] z-10 overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#00FF41]/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Headlines */}
      <div className="flex flex-col items-center text-center gap-3 sm:gap-4 mb-10 sm:mb-16 md:mb-20 relative z-20">
        <h2 className="font-display text-3xl sm:text-5xl md:text-7xl font-black leading-[1.0] tracking-tight uppercase flex flex-col items-center">
          <span className="text-white/90">First AI-Native</span>
          <span
            className="text-transparent mt-1 sm:mt-2"
            style={{
              WebkitTextStroke: "1.5px #00FF41",
              filter: "drop-shadow(0 0 15px rgba(0,255,65,0.4))",
            }}
          >
            Collaborative IDE
          </span>
        </h2>
        <p className="font-sans text-white/50 text-sm sm:text-base md:text-lg max-w-xl mx-auto mt-1 sm:mt-2 px-2">
          Create sessions, execute code, and pair program faster than <br/> ever before.
        </p>
      </div>

      {/* Product Mockup Panel */}
      <div 
        className="w-full max-w-6xl relative z-20 rounded-xl sm:rounded-[2rem] border border-white/10 bg-black/60 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,255,65,0.1)] overflow-hidden flex flex-col"
      >
        {/* Mock OS Header */}
        <div className="flex items-center px-3 sm:px-6 py-3 sm:py-4 border-b border-white/5 bg-white/5 gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white/20"></div>
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white/20"></div>
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white/20"></div>
          <div className="mx-auto text-[8px] sm:text-[10px] uppercase tracking-widest font-mono text-white/40">
            Session // {currentFile.name}
          </div>
        </div>

        {/* 3-Column Mockup Interface */}
        <div className="flex w-full h-[320px] sm:h-[420px] md:h-[500px] lg:h-[600px] relative">
          
          {/* Left Sidebar (Files / Sections) */}
          <div className="w-64 border-r border-white/5 p-4 flex-col gap-4 hidden md:flex">
             <div className="text-xs uppercase tracking-widest text-[#00FF41] font-mono mb-4 border-b border-white/5 pb-2">Workspace</div>
             
             {FILES.map((file, i) => (
                <div
                  key={i}
                  onClick={() => setActiveFile(i)}
                  className={`flex items-center gap-3 text-sm cursor-pointer transition-colors ${
                    i === activeFile
                      ? "text-[#00FF41]"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-sm border ${
                    i === activeFile ? "border-[#00FF41]/60 bg-[#00FF41]/10" : "border-white/20"
                  }`}></div>
                  {file.name}
                </div>
             ))}
          </div>

          {/* Center Main Canvas */}
          <div className="flex-1 bg-[#0a0a0a] relative overflow-hidden flex items-start justify-start p-2 sm:p-4 md:p-8">
             <div className="w-full h-full border border-white/10 rounded-lg sm:rounded-xl bg-black flex flex-col relative overflow-hidden">
                {/* Code Block */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFile}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="p-3 sm:p-4 md:p-6 text-[11px] sm:text-xs md:text-sm leading-relaxed sm:leading-loose w-full overflow-x-auto"
                  >
                    <SyntaxHighlighter
                      language={currentFile.language}
                      style={editorTheme}
                      showLineNumbers
                      lineNumberStyle={{
                        color: "rgba(255,255,255,0.2)",
                        minWidth: "1.5em",
                        paddingRight: "1em",
                        userSelect: "none",
                      }}
                      wrapLines
                      customStyle={{
                        background: "transparent",
                        margin: 0,
                        padding: 0,
                      }}
                    >
                      {currentFile.code}
                    </SyntaxHighlighter>
                  </motion.div>
                </AnimatePresence>

                {/* Floating cursor mock */}
                <motion.div 
                  className="absolute top-1/3 sm:top-1/2 left-1/4 sm:left-1/3 flex flex-col items-start pointer-events-none"
                  animate={{ x: [0, 30, 15, 0], y: [0, 15, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg width="14" height="15" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-[18px] sm:h-[19px] drop-shadow-md origin-top-left z-10">
                    <path d="M1.2001 0.700012L15.3001 6.80001L8.7001 9.40001L6.1001 16L1.2001 0.700012Z" fill="#00FF41" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
                  </svg>
                  <div className="bg-[#00FF41] text-black text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-sm rounded-tl-none whitespace-nowrap shadow-lg ml-2 sm:ml-3 mt-0.5">Guest User</div>
                </motion.div>
             </div>
          </div>

          {/* Right Properties Panel (Terminal/Console) */}
          <div className="w-64 border-l border-white/5 bg-[#050505] p-4 flex-col gap-4 hidden lg:flex relative">
             <div className="text-xs uppercase tracking-widest text-white/50 font-mono mb-4 border-b border-white/5 pb-2">Terminal Output</div>
             
             <div className="font-mono text-xs text-white/40 space-y-3">
               <div>&gt; Build started...</div>
               <div className="text-[#00FF41]">&gt; Compilation successful (0ms)</div>
               <div>&gt; Listening on port 3000</div>
               <div className="w-1/2 h-2 bg-white/10 mt-6 rounded-full animate-pulse"></div>
               <div className="w-3/4 h-2 bg-white/10 mt-2 rounded-full animate-pulse"></div>
               <div className="w-2/3 h-2 bg-white/10 mt-2 rounded-full animate-pulse"></div>
             </div>

             <div className="absolute bottom-6 left-4 right-4">
               <button className="w-full bg-white/5 border border-white/10 rounded-lg py-2 text-xs font-mono text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                  Clear Output
               </button>
             </div>
          </div>

        </div>
      </div>

    </section>
  );
};
