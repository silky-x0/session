import { useEffect, type RefObject } from "react";
import { useOthersMapped, useUpdateMyPresence } from "@liveblocks/react/suspense";
import { shallow } from "@liveblocks/react";
import Cursor from "./Cursor";

type Props = {
  /** The element used for pointer events and scroll position */
  cursorPanel: RefObject<HTMLElement | null>;
};

/**
 * Renders live cursors for all other users in the room.
 * Tracks mouse position relative to cursorPanel and broadcasts via presence.
 * Must be rendered inside a positioned parent that contains cursorPanel.
 */
export default function LiveCursors({ cursorPanel }: Props) {
  const updateMyPresence = useUpdateMyPresence();

  const others = useOthersMapped(
    (other) => ({
      cursor: other.presence.cursor,
      info: {
        name: other.presence.info?.name ?? other.info?.name,
        color: other.presence.info?.color ?? other.info?.color,
      },
    }),
    shallow,
  );

  useEffect(() => {
    if (!(cursorPanel?.current instanceof HTMLElement)) {
      console.warn("LiveCursors: cursorPanel ref must contain an HTMLElement.");
      return;
    }

    const updateCursor = (event: PointerEvent) => {
      if (!cursorPanel?.current) return;

      let target = event.target as HTMLElement | null;
      let elementId: string = "global";
      let targetRect: DOMRect | null = null;

      const PANEL_IDS = [
        "workspace-panel",
        "chat-panel",
        "output-panel",
        "problem-panel",
        "topbar-panel",
        "problem-tab"
      ];

      while (target && target !== document.documentElement) {
        if (target.id && PANEL_IDS.includes(target.id)) {
          elementId = target.id;
          targetRect = target.getBoundingClientRect();
          break;
        }
        target = target.parentElement;
      }

      if (!targetRect) {
        elementId = "global";
        targetRect = cursorPanel.current.getBoundingClientRect();
      }

      const width = targetRect.width;
      const isRightHalf = (event.clientX - targetRect.left) > (width / 2);
      const anchorX: "left" | "right" = isRightHalf ? "right" : "left";

      const x = isRightHalf ? (targetRect.right - event.clientX) : (event.clientX - targetRect.left);
      const y = event.clientY - targetRect.top;

      updateMyPresence({
        cursor: { elementId, anchorX, x: Math.round(x), y: Math.round(y) },
      });
    };

    const removeCursor = () => {
      updateMyPresence({ cursor: null });
    };

    window.addEventListener("pointermove", updateCursor);
    window.addEventListener("pointerleave", removeCursor);

    return () => {
      window.removeEventListener("pointermove", updateCursor);
      window.removeEventListener("pointerleave", removeCursor);
    };
  }, [updateMyPresence, cursorPanel]);

  return (
    <>
      {others.map(([id, other]) => {
        if (other.cursor == null) return null;

        const { elementId, anchorX, x, y } = other.cursor;
        let renderX = x;
        let renderY = y;

        if (elementId && elementId !== "global") {
          const panelElement = document.getElementById(elementId);
          if (panelElement && cursorPanel.current) {
            const panelRect = panelElement.getBoundingClientRect();
            const containerRect = cursorPanel.current.getBoundingClientRect();

            let absX = 0;
            if (anchorX === "right") {
              absX = panelRect.right - containerRect.left - x;
            } else {
              absX = panelRect.left - containerRect.left + x;
            }

            renderX = absX;
            renderY = panelRect.top - containerRect.top + y;
          } else {
            // Element is collapsed/hidden locally, do not render cursor
            return null;
          }
        } else {
          if (cursorPanel.current) {
            const containerRect = cursorPanel.current.getBoundingClientRect();
            let absX = 0;
            if (anchorX === "right") {
              absX = containerRect.right - containerRect.left - x;
            } else {
              absX = x;
            }
            renderX = absX;
          }
        }

        return (
          <Cursor
            key={id}
            name={other.info?.name ?? "Anonymous"}
            color={other.info?.color ?? "var(--color-neon-pulse)"}
            x={renderX}
            y={renderY}
          />
        );
      })}
    </>
  );
}
