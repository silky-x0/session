import { useMemo } from "react";
import { motion } from "framer-motion";
import { getContrastingColor } from "../../utils/getContrastingColor";

type CursorProps = {
  x: number;
  y: number;
  color: string;
  name: string;
};

export default function Cursor({ x, y, color, name }: CursorProps) {
  const textColor = useMemo(
    () => getContrastingColor(color),
    [color],
  );

  return (
    <motion.div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 50,
      }}
      initial={{ x, y }}
      animate={{ x, y }}
      transition={{
        type: "spring",
        bounce: 0.6,
        damping: 30,
        mass: 0.8,
        stiffness: 350,
        restSpeed: 0.01,
      }}
    >
      <div style={{ position: "relative" }}>
        {/* Cursor SVG */}
        <svg
          width="32"
          height="44"
          viewBox="0 0 24 36"
          fill="none"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <path
            fill={color}
            d="M0.928548 2.18278C0.619075 1.37094 1.42087 0.577818 2.2293 0.896107L14.3863 5.68247C15.2271 6.0135 15.2325 7.20148 14.3947 7.54008L9.85984 9.373C9.61167 9.47331 9.41408 9.66891 9.31127 9.91604L7.43907 14.4165C7.09186 15.2511 5.90335 15.2333 5.58136 14.3886L0.928548 2.18278Z"
          />
        </svg>

        {/* Name pill */}
        <div
          style={{
            position: "absolute",
            top: "1rem",
            left: "1rem",
            padding: "0.25rem 0.5rem",
            fontSize: "0.75rem",
            lineHeight: "1rem",
            fontWeight: 600,
            whiteSpace: "nowrap",
            borderRadius: "0.375rem",
            backgroundColor: color,
            color: textColor,
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {name}
        </div>
      </div>
    </motion.div>
  );
}
