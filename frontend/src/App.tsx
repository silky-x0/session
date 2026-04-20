import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy, useState, useEffect } from "react";
import { LiveblocksProvider } from "@liveblocks/react/suspense";
import { ErrorBoundary } from "react-error-boundary";
import LandingPage from "./pages/LandingPage";
import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";
import AboutPage from "./pages/AboutPage";
import { AnimatePresence } from "framer-motion";
import { RouteTransition } from "./components/RouteTransition";
import HeroText from "./components/ui/hero-shutter-text";

const CodeEditor = lazy(() => import("./components/Editor"));

function EditorLoadingFallback() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background fixed inset-0 z-50">
      <HeroText text="LOADING" hideControls={true} />
    </div>
  );
}

function GlobalErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: unknown;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 max-w-md text-center p-6">
        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
          <span className="text-red-400 text-xl">⚠</span>
        </div>
        <h2 className="text-foreground text-lg font-semibold">
          Something went wrong
        </h2>
        <p className="text-muted-foreground text-sm">{error instanceof Error ? error.message : String(error)}</p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/30 
                     hover:bg-primary/30 transition-colors text-sm font-medium cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const [editorReady, setEditorReady] = useState(false);

  // Reset ready state every time we navigate to a fresh route
  useEffect(() => {
    setEditorReady(false);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <RouteTransition text="SESSION">
              <LandingPage />
            </RouteTransition>
          } 
        />
        <Route 
          path="/features" 
          element={
            <RouteTransition text="FEATURES">
              <FeaturesPage />
            </RouteTransition>
          } 
        />
        <Route 
          path="/pricing" 
          element={
            <RouteTransition text="PRICING">
              <PricingPage />
            </RouteTransition>
          } 
        />
        <Route 
          path="/about" 
          element={
            <RouteTransition text="ABOUT">
              <AboutPage />
            </RouteTransition>
          } 
        />
        <Route
          path="/editor"
          element={
            <RouteTransition text="WORKSPACE" isReady={editorReady}>
              <Suspense fallback={<EditorLoadingFallback />}>
                <CodeEditor onRoomReady={() => setEditorReady(true)} />
              </Suspense>
            </RouteTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
      <LiveblocksProvider
        publicApiKey={import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY as string}
        throttle={50}
        preventUnsavedChanges
        lostConnectionTimeout={5000}
        backgroundKeepAliveTimeout={15 * 60 * 1000}
        resolveUsers={async ({ userIds }) => {
          return userIds.map((id) => ({
            name: id.startsWith("User-") ? id : `User ${id.slice(0, 6)}`,
            color:
              "#" +
              Math.abs(
                id.split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)
              )
                .toString(16)
                .slice(0, 6)
                .padStart(6, "0"),
            avatar: undefined,
          }));
        }}
        resolveRoomsInfo={async ({ roomIds }) => {
          return roomIds.map((roomId) => ({
            title: `Room: ${roomId}`,
            url: `/editor?room=${roomId}`,
          }));
        }}
      >
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </LiveblocksProvider>
    </ErrorBoundary>
  );
}

export default App;
