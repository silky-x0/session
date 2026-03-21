import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a ref that always holds the latest bounding rect of the target element.
 * The rect updates on scroll, resize, and animation frames.
 */
export function useBoundingClientRectRef(
  ref: React.RefObject<HTMLElement | null>,
) {
  const rectRef = useRef<DOMRect>(new DOMRect());

  const updateRect = useCallback(() => {
    if (ref.current) {
      rectRef.current = ref.current.getBoundingClientRect();
    }
  }, [ref]);

  useEffect(() => {
    updateRect();

    // Update on scroll (any ancestor) and resize
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);

    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [updateRect]);

  return rectRef;
}
