import { useState } from "react";

interface Metadata {
  title?: string;
  difficulty?: string;
  question?: string;
  hints?: string[];
  complexity?: { time: string; space: string };
  fullSolution?: string;
}

interface ProblemPanelProps {
  metadata: Metadata;
  onRevealAnswer: () => void;
}

export default function ProblemPanel({ metadata }: Omit<ProblemPanelProps, 'onRevealAnswer'>) {
  const [showHints, setShowHints] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy": return "#4CAF50";
      case "medium": return "#FF9800";
      case "hard": return "#F44336";
      default: return "#888";
    }
  };

  return (
    <>
      <div style={{
        background: "#1e1e1e",
        borderBottom: "1px solid #333",
        color: "#fff",
        padding: isCollapsed ? "10px 15px" : "15px",
        maxHeight: isCollapsed ? "50px" : "400px",
        overflow: "auto",
        transition: "max-height 0.3s ease"
      }}>
        {/* Header with collapse toggle */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: isCollapsed ? 0 : "10px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {metadata.difficulty && (
              <span style={{
                background: getDifficultyColor(metadata.difficulty),
                padding: "4px 10px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "bold"
              }}>
                {metadata.difficulty.toUpperCase()}
              </span>
            )}
            <h3 style={{ margin: 0, fontSize: "18px" }}>{metadata.title}</h3>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: "transparent",
              border: "1px solid #555",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            {isCollapsed ? "▼ Show" : "▲ Hide"}
          </button>
        </div>

        {!isCollapsed && (
          <>
            {/* Question */}
            {metadata.question && (
              <div style={{
                marginBottom: "15px",
                padding: "10px",
                background: "#2d2d2d",
                borderRadius: "4px",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap"
              }}>
                {metadata.question}
              </div>
            )}

            {/* Complexity */}
            {metadata.complexity && (
              <div style={{ marginBottom: "15px", fontSize: "14px", color: "#aaa" }}>
                <strong>Complexity:</strong>{" "}
                Time: <code style={{ color: "#4CAF50" }}>{metadata.complexity.time}</code>,{" "}
                Space: <code style={{ color: "#4CAF50" }}>{metadata.complexity.space}</code>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
              {metadata.hints && metadata.hints.length > 0 && (
                <button
                  onClick={() => setShowHints(true)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "4px",
                    border: "none",
                    background: "#2196F3",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  💡 Show Hints ({metadata.hints.length})
                </button>
              )}
              {metadata.fullSolution && (
                <button
                  onClick={() => setShowAnswer(true)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "4px",
                    border: "none",
                    background: "#F44336",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  🔓 Reveal Answer
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Hints Popup Modal */}
      {showHints && metadata.hints && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#2d2d2d",
          border: "2px solid #4CAF50",
          borderRadius: "8px",
          padding: "20px",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "400px",
          overflow: "auto",
          zIndex: 1000,
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px"
          }}>
            <h3 style={{ margin: 0, color: "#4CAF50" }}>💡 Hints</h3>
            <button
              onClick={() => setShowHints(false)}
              style={{
                background: "transparent",
                border: "1px solid #666",
                color: "#fff",
                padding: "4px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              ✕ Close
            </button>
          </div>
          <div style={{ color: "#ddd", lineHeight: "1.8" }}>
            {metadata.hints.map((hint, index) => (
              <div key={index} style={{ marginBottom: "10px" }}>
                <strong>{index + 1}.</strong> {hint}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answer Popup Modal */}
      {showAnswer && metadata.fullSolution && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#2d2d2d",
          border: "2px solid #F44336",
          borderRadius: "8px",
          padding: "20px",
          maxWidth: "800px",
          width: "90%",
          maxHeight: "80vh",
          overflow: "auto",
          zIndex: 1000,
          boxShadow: "0 8px 32px rgba(0,0,0,0.7)"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px"
          }}>
            <h3 style={{ margin: 0, color: "#F44336" }}>🔓 Solution</h3>
            <button
              onClick={() => setShowAnswer(false)}
              style={{
                background: "transparent",
                border: "1px solid #666",
                color: "#fff",
                padding: "4px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              ✕ Close
            </button>
          </div>
          <pre style={{
            color: "#ddd",
            lineHeight: "1.6",
            background: "#1e1e1e",
            padding: "15px",
            borderRadius: "4px",
            overflow: "auto",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word"
          }}>
            <code>{metadata.fullSolution}</code>
          </pre>
        </div>
      )}
    </>
  );
}
