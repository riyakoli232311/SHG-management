import React, { useEffect, useRef, useState } from "react";

const randomColors = (count: number) =>
  Array.from(
    { length: count },
    () => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")
  );

interface TubesBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  enableClickInteraction?: boolean;
}

export function TubesBackground({
  children,
  className = "",
  enableClickInteraction = true,
}: TubesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tubesRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!canvasRef.current) return;
      try {
        // Dynamically load the threejs-components tubes cursor effect from CDN
        // @ts-ignore
        const mod = await import(
          /* @vite-ignore */
          "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js"
        );
        if (!mounted) return;

        const TubesCursor = mod.default;
        const app = TubesCursor(canvasRef.current, {
          tubes: {
            colors: ["#C2185B", "#6A1B9A", "#EF9767"],
            lights: {
              intensity: 300,
              colors: ["#ff4d8d", "#9c27b0", "#ff6e40", "#bd74ff"],
            },
          },
        });

        tubesRef.current = app;
        if (mounted) setIsLoaded(true);
      } catch (e) {
        console.error("TubesBackground: Failed to load effect", e);
        if (mounted) setError(true);
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, []);

  const handleClick = () => {
    if (!enableClickInteraction || !tubesRef.current) return;
    tubesRef.current.tubes?.setColors?.(randomColors(3));
    tubesRef.current.tubes?.setLightsColors?.(randomColors(4));
  };

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      onClick={handleClick}
      style={{ cursor: enableClickInteraction ? "pointer" : "default" }}
    >
      {/* Fallback gradient shown before WebGL loads or if it fails */}
      {(!isLoaded || error) && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0010] via-[#2d0845] to-[#0a0a1a]" />
      )}

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{ touchAction: "none", opacity: isLoaded ? 1 : 0, transition: "opacity 1s ease" }}
      />

      {/* Dark overlay to keep text readable */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* Content layer */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        {children}
      </div>
    </div>
  );
}

export default TubesBackground;
