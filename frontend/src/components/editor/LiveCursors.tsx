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
      info: other.info,
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

      const rect = cursorPanel.current.getBoundingClientRect();
      const x = event.clientX - rect.x + cursorPanel.current.scrollLeft;
      const y = event.clientY - rect.y + cursorPanel.current.scrollTop;

      updateMyPresence({
        cursor: { x: Math.round(x), y: Math.round(y) },
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

        return (
          <Cursor
            key={id}
            name={other.info?.name ?? "Anonymous"}
            color={other.info?.color ?? "#00FF41"}
            x={other.cursor.x}
            y={other.cursor.y}
          />
        );
      })}
    </>
  );
}
