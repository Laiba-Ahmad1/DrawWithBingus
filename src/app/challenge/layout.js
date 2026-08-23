"use client";

import { useEffect, useRef } from "react";
import rough from "roughjs";

export default function ChallengeLayout({ children }) {
  const bgCanvasRef = useRef(null);
  const borderCanvasRef = useRef(null);
  const cardRef = useRef(null);

  // full-page hatched background
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const rc = rough.canvas(canvas);
      const spacing = 16;

      for (let x = -height; x < width; x += spacing) {
        rc.line(x, height, x + height, 0, {
          stroke: "rgba(0, 0, 0, 0.15)",
          strokeWidth: 1.2,
          roughness: 1.5,
        });
      }
    };

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);

  // card border, sized off the actual rendered card
  useEffect(() => {
    const canvas = borderCanvasRef.current;
    const card = cardRef.current;
    if (!canvas || !card) return;

    const drawBorder = () => {
      const { width, height } = card.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;

      const rc = rough.canvas(canvas);
      rc.rectangle(3, 3, width - 6, height - 6, {
        stroke: "black",
        strokeWidth: 3,
        roughness: 4.5,
      });
    };

    drawBorder();
    window.addEventListener("resize", drawBorder);
    return () => window.removeEventListener("resize", drawBorder);
  }, []);

  return (
    <main className="min-h-screen w-full overflow-y-auto flex items-center justify-center bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 relative">
      <canvas
        ref={bgCanvasRef}
        className="fixed inset-0 pointer-events-none "
        style={{ zIndex: 0 }}
      />
    <div
    ref={cardRef}
    className="relative w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl min-h-[580px] bg-zinc-50 flex flex-col items-center gap-6 justify-center px-4 py-8 sm:gap-10 sm:px-8"
    style={{ zIndex: 1 }}
      >
        <canvas
          ref={borderCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 3 }}
        />
        {children}
      </div>
    </main>
  );
}   