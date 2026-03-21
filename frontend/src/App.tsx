import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { LiveblocksProvider } from "@liveblocks/react/suspense";
import LandingPage from './pages/LandingPage';

const CodeEditor = lazy(() => import("./components/Editor"));

function EditorLoadingFallback() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-muted-foreground text-sm">Loading editor...</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <LiveblocksProvider publicApiKey={import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY as string}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/editor" 
            element={
              <Suspense fallback={<EditorLoadingFallback />}>
                <CodeEditor />
              </Suspense>
            } 
          />
        </Routes>
      </BrowserRouter>
    </LiveblocksProvider>
  );
}

export default App;
