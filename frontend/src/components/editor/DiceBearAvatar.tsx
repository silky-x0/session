import React, { useMemo } from "react";
import { Avatar } from "@dicebear/core";
// @ts-ignore - JSON imports with 'with' might not be fully recognized by all TS versions
import lorelei from "@dicebear/styles/lorelei.json" with { type: "json" };

interface DiceBearAvatarProps {
  seed: string;
  size?: number;
  className?: string;
}

/**
 * A component that generates an avatar using DiceBear.
 * It uses the 'lorelei' style by default and is deterministic based on the seed.
 */
export const DiceBearAvatar = React.memo(({ seed, size = 32, className }: DiceBearAvatarProps) => {
  const avatarSvg = useMemo(() => {
    const avatar = new Avatar(lorelei, {
      seed,
      size,
    });
    return avatar.toString();
  }, [seed, size]);

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: avatarSvg }}
      style={{ width: size, height: size }}
    />
  );
});

DiceBearAvatar.displayName = "DiceBearAvatar";
