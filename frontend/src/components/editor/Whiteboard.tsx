import { useRef, useState, useEffect, useCallback } from "react";
import { useUpdateMyPresence } from "@liveblocks/react/suspense";
import { motion } from "framer-motion";
import { useTheme } from "../ThemeContext";
import { Excalidraw } from "@excalidraw/excalidraw";
import * as Y from "yjs";

// Import Excalidraw styles
import "@excalidraw/excalidraw/index.css";

type ExcalidrawElement = any;

// Helper: Custom throttle function that supports trailing execution.
// This is critical for drawing sync, ensuring the final stroke/shape is broadcasted.
function throttle<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: any[] | null = null;
  let lastThis: any = null;
  let lastCallTime = 0;

  const throttled = function(this: any, ...args: any[]) {
    const now = Date.now();
    const remaining = delay - (now - lastCallTime);

    lastArgs = args;
    lastThis = this;

    if (remaining <= 0 || remaining > delay) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCallTime = now;
      func.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        timeoutId = null;
        if (lastArgs) {
          func.apply(lastThis, lastArgs);
          lastArgs = null;
          lastThis = null;
        }
      }, remaining);
    }
  };

  return throttled as any;
}

export function Whiteboard({ yWhiteboard }: { yWhiteboard: Y.Text | null }) {
  const { theme } = useTheme();
  const updateMyPresence = useUpdateMyPresence();
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  
  const isRemoteUpdateRef = useRef(false);
  const isInitializedRef = useRef(false);
  const lastSignatureRef = useRef<string>("");

  // Helper to generate a unique signature for comparing shapes state
  const getElementsSignature = (elements: readonly ExcalidrawElement[]) => {
    return elements.map((el) => `${el.id}:${el.version}`).join(";");
  };

  // Sync from Yjs Text store into Excalidraw
  useEffect(() => {
    if (!yWhiteboard || !excalidrawAPI) return;

    // Load initial data on mount
    const initialText = yWhiteboard.toString();
    if (initialText) {
      try {
        const parsed = JSON.parse(initialText) as ExcalidrawElement[];
        isRemoteUpdateRef.current = true;
        excalidrawAPI.updateScene({ elements: parsed });
        lastSignatureRef.current = getElementsSignature(parsed);
      } catch (e) {
        console.error("Error parsing initial Yjs whiteboard state:", e);
      }
    }

    // Delay activation of Yjs sync writes to let Excalidraw's initial mounts settle
    const timer = setTimeout(() => {
      isInitializedRef.current = true;
    }, 200);

    // React to remote changes within the Yjs text block
    const observer = () => {
      const text = yWhiteboard.toString();
      if (!text) {
        // Clear whiteboard if text is empty
        const currentElements = excalidrawAPI.getSceneElements();
        if (currentElements && currentElements.length > 0) {
          isRemoteUpdateRef.current = true;
          excalidrawAPI.updateScene({ elements: [], commitToHistory: false });
          lastSignatureRef.current = "";
        }
        return;
      }

      try {
        const parsed = JSON.parse(text) as ExcalidrawElement[];
        const remoteSig = getElementsSignature(parsed);
        const localSig = getElementsSignature(excalidrawAPI.getSceneElements());

        // Update local Excalidraw scene only if it differs from local
        if (remoteSig !== localSig) {
          isRemoteUpdateRef.current = true;
          excalidrawAPI.updateScene({ elements: parsed });
          lastSignatureRef.current = remoteSig;
        }
      } catch (e) {
        console.error("Error parsing Yjs whiteboard update:", e);
      }
    };

    yWhiteboard.observe(observer);
    return () => {
      yWhiteboard.unobserve(observer);
      clearTimeout(timer);
    };
  }, [yWhiteboard, excalidrawAPI]);

  // Load software architecture excalidraw library items on mount
  useEffect(() => {
    if (!excalidrawAPI) return;

    const libraryFiles = [
      "software-architecture.excalidrawlib",
      "architecture-diagram-components.excalidrawlib",
      "drwnio.excalidrawlib",
      "system-design.excalidrawlib",
    ];

    Promise.all(
      libraryFiles.map((file) =>
        fetch(`/${file}`)
          .then((res) => res.json())
          .catch((err) => {
            console.error(`Failed to load library file: ${file}`, err);
            return null;
          })
      )
    )
      .then((results) => {
        const combinedItems: any[] = [];
        results.forEach((data, fileIndex) => {
          if (data && data.type === "excalidrawlib" && Array.isArray(data.library)) {
            const fileNamePrefix = libraryFiles[fileIndex].replace(".excalidrawlib", "");
            data.library.forEach((elements: any[], itemIndex: number) => {
              combinedItems.push({
                id: `${fileNamePrefix}-${itemIndex}`,
                status: "unpublished" as const,
                created: Date.now(),
                elements,
              });
            });
          }
        });

        if (combinedItems.length > 0) {
          excalidrawAPI.updateLibrary({ libraryItems: combinedItems, merge: true });
        }
      })
      .catch((err) => {
        console.error("Failed to load excalidraw libraries:", err);
      });
  }, [excalidrawAPI]);

  // Throttled handler to update the shared Yjs text block
  const updateYjs = useCallback(
    throttle((elements: readonly ExcalidrawElement[]) => {
      if (!yWhiteboard) return;
      
      const serialized = JSON.stringify(elements);
      if (yWhiteboard.toString() !== serialized) {
        yWhiteboard.doc?.transact(() => {
          yWhiteboard.delete(0, yWhiteboard.length);
          yWhiteboard.insert(0, serialized);
        });
        lastSignatureRef.current = getElementsSignature(elements);
      }
    }, 200),
    [yWhiteboard]
  );

  // Handle local user edits on the Excalidraw canvas
  const handleChange = (elements: readonly ExcalidrawElement[]) => {
    if (!isInitializedRef.current) {
      // Reject empty updates from Excalidraw initialization to prevent over-writing database
      return;
    }

    if (isRemoteUpdateRef.current) {
      // Remote update was set programmatically. Just update signatures.
      isRemoteUpdateRef.current = false;
      lastSignatureRef.current = getElementsSignature(elements);
      return;
    }

    // Local user modification. Update Yjs store.
    updateYjs(elements);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col glass-panel rounded-lg overflow-hidden relative border border-glass-border h-full"
      onMouseEnter={() => updateMyPresence({ hoveredPanel: "whiteboard" })}
      onMouseLeave={() => updateMyPresence({ hoveredPanel: null })}
    >
      <div className="flex-1 w-full h-full min-h-0 relative bg-background select-none">
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          theme={theme === "light" ? "light" : "dark"}
          onChange={handleChange}
          UIOptions={{
            canvasActions: {
              toggleTheme: false,
              loadScene: false,
              saveToActiveFile: false,
            },
          }}
        />
      </div>
    </motion.div>
  );
}
