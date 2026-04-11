import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { LiveblocksProvider } from "@liveblocks/react/suspense";
import { ErrorBoundary } from "react-error-boundary";
import LandingPage from "./pages/LandingPage";

const CodeEditor = lazy(() => import("./components/Editor"));

function EditorLoadingFallback() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-muted-foreground text-sm">
          Loading editor...
        </span>
      </div>
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

function App() {
  return (
    <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
      <LiveblocksProvider
        publicApiKey={import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY as string}
        // ─── Performance ───
        throttle={50} // ~20 FPS for smooth cursor updates
        // ─── Data Safety ───
        preventUnsavedChanges // Warn before closing tab with pending changes
        // ─── Connection Resilience ───
        lostConnectionTimeout={5000} // Fire lost-connection event after 5s
        // ─── Background Tab Optimization ───
        backgroundKeepAliveTimeout={15 * 60 * 1000} // Disconnect after 15min inactive
        // ─── User Resolution ───
        // Resolves user IDs into display info for Comments/Notifications
        resolveUsers={async ({ userIds }) => {
          // Return user objects matching the UserMeta["info"] shape
          // In production, fetch from your API. For now, generate from ID.
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
        // ─── Room Info Resolution (for Notifications) ───
        resolveRoomsInfo={async ({ roomIds }) => {
          return roomIds.map((roomId) => ({
            title: `Room: ${roomId}`,
            url: `/editor?room=${roomId}`,
          }));
        }}
      >
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
    </ErrorBoundary>
  );
}

export default App;
