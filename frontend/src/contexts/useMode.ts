import { useContext } from "react";
import { ModeContext } from "./ModeContext";

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
};
