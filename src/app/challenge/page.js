"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import rough from "roughjs";
import toast from "react-hot-toast";
import Link from "next/link";

// ── Prompts + "computer" (pre-made) drawings ────────────────────────────────
// Each prompt maps to a pre-made drawing image (drawn by you/Bingus ahead of
// time, stored in /public or on Cloudinary). This is NOT AI-generated —
// it's just a static image swapped in based on the prompt, like you wanted.
const CHALLENGES = [
  {
    prompt: "best cat ever",
    computerDrawing: "/computer-drawings/best-cat-ever.png",
  },
  {
    prompt: "person eating apple with fork",
    computerDrawing: "/computer-drawings/person-eating-apple-with-fork.png",
  },
  {
    prompt: "something that reminds you of childhood",
    computerDrawing:
      "/computer-drawings/something-that-reminds-you-of-childhood.png",
  },
  {
    prompt: "your favourite dish",
    computerDrawing: "/computer-drawings/your-favourite-dish.png",
  },
  {
    prompt: "a cat in a spacesuit",
    computerDrawing: "/computer-drawings/a-cat-in-a-spacesuit.png",
  },
  {
    prompt: "a slice of pizza eating a human",
    computerDrawing: "/computer-drawings/a-slice-of-pizza-eating-a-human.png",
  },
  {
    prompt: "a cat that is eating your homework",
    computerDrawing:
      "/computer-drawings/a-cat-that-is-eating-your-homework.png",
  },
  {
    prompt: "bingus ending the world",
    computerDrawing: "/computer-drawings/bingus-ending-the-world.png",
  },
  {
    prompt: "an angry potato",
    computerDrawing: "/computer-drawings/an-angry-potato.png",
  },
  {
    prompt: "monsa lisa taking selfie with bingus",
    computerDrawing: "/computer-drawings/monsa-lisa-taking-selfie.png",
  },
  {
    prompt: "a cactus trying to hug you",
    computerDrawing: "/computer-drawings/cactus-trying-to-hug.png",
  },
  {
    prompt: "a computer mouse running away from a real cat",
    computerDrawing: "/computer-drawings/computer-mouse.png",
  },
];

const ROUND_SECONDS = 60; // "under 1 minute" — bump to 90 if you want the 1:30 you mentioned earlier

// Gap (px) between the sketchy border and the canvas — real CSS padding now,
// not a manually-synced offset between two separately-positioned elements.
const BORDER_PAD = 6;

// Max undo steps kept in memory — capped so someone drawing for the full
// 60 seconds with lots of tiny strokes doesn't quietly balloon memory with
// full-canvas snapshots.
const MAX_HISTORY = 30;

// ── Color palette ────────────────────────────────────────────────────────
const COLORS = [
  "#111111", // black (default)
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ec4899", // pink
  "#B97A57", //brown
  "#ffffff", // white (acts as an eraser against the white background)
];

// ── Brush sizes ──────────────────────────────────────────────────────────
const BRUSH_SIZES = [
  { label: "S", width: 2 },
  { label: "M", width: 4 },
  { label: "L", width: 8 },
  { label: "XL", width: 14 },
];

export default function DrawingChallenge() {
  const router = useRouter();
  // game phases: "ready" -> "drawing" -> "done"
  const [phase, setPhase] = useState("ready");
  const [challenge, setChallenge] = useState(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [userDrawingUrl, setUserDrawingUrl] = useState(null);
  const [activeColor, setActiveColor] = useState(COLORS[0]);
  const [activeBrush, setActiveBrush] = useState(BRUSH_SIZES[1]); // default to "M"
  const [posted, setPosted] = useState(false);
  const [loading, setLoading] = useState(false);
  // tracks whether there's anything to undo, purely to grey out the button —
  // the actual undo stack lives in historyRef, not in state (state would
  // re-render on every single stroke otherwise)
  const [canUndo, setCanUndo] = useState(false);

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const timerRef = useRef(null);
  const borderSvgRef = useRef(null); // overlay svg the rough.js border is drawn into
  // Mirrors activeColor in a ref so handleMove (which isn't re-created on
  // every color change) always reads the latest pick without going stale.
  const colorRef = useRef(COLORS[0]);
  // Same reasoning for brush size.
  const brushRef = useRef(BRUSH_SIZES[1].width);
  // Stack of ImageData snapshots, one pushed right before each stroke starts.
  // Undo pops the most recent one back onto the canvas.
  const historyRef = useRef([]);

  // ── Pick a random prompt each time the game starts ────────────────────────
  const challengeBagRef = useRef([]);
  const startChallenge = useCallback(() => {
    if (challengeBagRef.current.length === 0) {
      challengeBagRef.current = [...CHALLENGES].sort(() => Math.random() - 0.5);
    }
    const random = challengeBagRef.current.pop();
    setChallenge(random);
    setTimeLeft(ROUND_SECONDS);
    setUserDrawingUrl(null);
    setActiveColor(COLORS[0]);
    colorRef.current = COLORS[0];
    setActiveBrush(BRUSH_SIZES[1]);
    brushRef.current = BRUSH_SIZES[1].width;
    setPosted(false);
    historyRef.current = []; // new round — old undo history is meaningless
    setCanUndo(false);
    setPhase("drawing");
  }, []);

  // ── Canvas setup: runs once we enter "drawing" phase, since that's when
  // the <canvas> element actually mounts ────────────────────────────────────
  useEffect(() => {
    if (phase !== "drawing") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // white background so exported PNG isn't transparent
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = colorRef.current;
    ctx.lineWidth = brushRef.current;
  }, [phase]);

  // ── Sketchy border: same rough.js treatment as the login/signup canvas.
  // Drawn into a separate SVG that sits behind the canvas, since rough.js
  // draws shapes as generated paths — it can't be applied as a CSS border.
  //
  // Uses a FIXED viewBox (0 0 500 500 — matches the canvas's own internal
  // resolution) and doesn't measure anything. Two earlier bugs are fixed by
  // this structure:
  //   1. The canvas is now a normal in-flow element (see below) instead of
  //      absolutely positioned — its box always has a real, definite size,
  //      so there's nothing to measure or resync via ResizeObserver, and
  //      nothing that can silently stop shrinking on smaller screens.
  //   2. The viewBox has margin around the 0–500 box, and overflow is set
  //      to visible, so rough.js's hand-drawn "bowing" (which curves each
  //      side outward past a straight line) has room to render instead of
  //      getting clipped on the far edges. ──────────────────────────────
  useEffect(() => {
    if (phase !== "drawing") return;
    const svg = borderSvgRef.current;
    if (!svg) return;

    const margin = 20; // room for the bow to extend past the 0–500 box
    svg.setAttribute(
      "viewBox",
      `${-margin} ${-margin} ${500 + margin * 2} ${500 + margin * 2}`,
    );
    svg.innerHTML = ""; // clear the previous sketch before redrawing

    const rc = rough.svg(svg);
    const node = rc.rectangle(6, 6, 488, 488, {
      stroke: "#111111",
      strokeWidth: 3,
      roughness: 1.6,
      bowing: 1,
      fill: "none",
    });
    svg.appendChild(node);
  }, [phase]);

  // ── Timer: separate effect so it only depends on phase, not every render ──
  useEffect(() => {
    if (phase !== "drawing") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          finishRound(); // time's up — auto submit whatever they've drawn
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── Pointer coords relative to canvas, scaled for any CSS resizing ────────
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const point = e.touches ? e.touches[0] : e;
    return {
      x: (point.clientX - rect.left) * scaleX,
      y: (point.clientY - rect.top) * scaleY,
    };
  };

  const handleStart = (e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    lastPointRef.current = getPos(e);

    // Snapshot the canvas as it looked BEFORE this stroke, so undo can
    // restore to exactly that state. One snapshot per stroke (not per
    // pixel/segment), so undo removes a whole pen-down-to-pen-up motion —
    // matches what people expect an undo button to do.
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
    setCanUndo(true);
  };

  const handleMove = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    // Read from refs, not the `activeColor`/`activeBrush` state vars — this
    // callback is attached once and doesn't get recreated on re-render, so
    // a stale closure would otherwise keep using whatever was picked first.
    ctx.strokeStyle = colorRef.current;
    ctx.lineWidth = brushRef.current;
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPointRef.current = pos;
  };

  const selectColor = (color) => {
    setActiveColor(color);
    colorRef.current = color;
  };

  const selectBrush = (brush) => {
    setActiveBrush(brush);
    brushRef.current = brush.width;
  };

  const handleEnd = () => {
    isDrawingRef.current = false;
  };

  const undo = () => {
    const last = historyRef.current.pop();
    if (!last) return; // nothing to undo
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.putImageData(last, 0, 0);
    setCanUndo(historyRef.current.length > 0);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    historyRef.current = []; // clearing is a hard reset, not an undoable step
    setCanUndo(false);
  };

  // ── End the round: export canvas, stop timer, move to reveal screen ───────
  const finishRound = () => {
    clearInterval(timerRef.current);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      setUserDrawingUrl(dataUrl);
    }
    setPhase("done");
  };

  const playAgain = () => setPhase("ready");

  // ── Posting is a separate, optional step from submitting: finishRound()
  // always fires onSubmit so you can save the drawing either way, but
  // onPost only fires if the user actively chooses to put it up for voting.
  const postForVoting = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: challenge.prompt,
          userDrawing: userDrawingUrl,
          computerDrawing: challenge.computerDrawing,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Post failed:", data.error);
        setLoading(false);
        return;
      }
      setPosted(true);
      setLoading(false);
      toast.success(
        "Posted for voting! Other users can vote once they're online.",
      );
      router.push("/posts");
    } catch (err) {
      console.error("Post failed:", err);
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  if (phase === "ready") {
    return (
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <div className="absolute top-6 left-3 flex gap-2">
          <Link
            href="/"
            className=" shrink-0 rounded-lg  text-sm font-semibold text-black  hover:text-gray-700 underline"
          >
            go to home
          </Link>
        </div>
        <h2 className="text-2xl font-bold dark:text-black">Ready to draw?</h2>
        <p className="text-gray-600">
          You'll get a random prompt and {ROUND_SECONDS} seconds to draw it.
          Bingus is drawing too — let's see who does better.
        </p>
        <button
          onClick={startChallenge}
          className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
        >
          Start Challenge
        </button>
      </div>
    );
  }

  if (phase === "drawing") {
    return (
      <div className="flex flex-col items-center gap-3 p-3 sm:p-4">
        <div className="flex w-full max-w-[500px] flex-col items-center gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <span className="text-base font-semibold sm:text-lg dark:text-black">
            Draw: <span className="text-purple-600">{challenge.prompt}</span>
          </span>
          <span
            className={`text-base font-mono font-bold sm:text-lg ${
              timeLeft <= 10 ? "text-red-500" : "text-gray-700"
            }`}
          >
            0:{String(timeLeft).padStart(2, "0")}
          </span>
        </div>

        {/* Canvas wrapper: canvas is now a NORMAL in-flow element (not
            absolutely positioned), sized via w-full + its own intrinsic
            1:1 ratio (h-auto), exactly like an <img> would be. This is
            what guarantees it actually shrinks on small screens — nothing
            here depends on `aspect-square` support or a JS measurement.
            Padding creates the real gap the sketchy border sits in. */}
        <div
          className="relative box-border w-full max-w-[500px]"
          style={{ padding: BORDER_PAD }}
        >
          <svg
            ref={borderSvgRef}
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          />
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className="relative block h-auto w-full touch-none rounded-sm bg-white shadow-sm"
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 px-2">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => selectColor(color)}
              aria-label={`Select color ${color}`}
              className={`h-8 w-8 shrink-0 rounded-full border-2 transition-transform ${
                activeColor === color
                  ? "scale-110 border-purple-600"
                  : "border-gray-300"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2">
          {BRUSH_SIZES.map((brush) => (
            <button
              key={brush.label}
              onClick={() => selectBrush(brush)}
              aria-label={`Brush size ${brush.label}`}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
                activeBrush.label === brush.label
                  ? "border-purple-600 bg-purple-50 text-purple-600"
                  : "border-gray-300 text-gray-500"
              }`}
            >
              {/* dot scales with actual brush width so it previews the stroke,
                  capped so XL doesn't blow past the button's bounds */}
              <span
                className="rounded-full bg-current"
                style={{
                  width: Math.min(brush.width, 16),
                  height: Math.min(brush.width, 16),
                }}
              />
            </button>
          ))}
        </div>

        <div className="flex w-full max-w-[500px] gap-3 px-2 sm:w-auto sm:px-0">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
          >
            Undo
          </button>
          <button
            onClick={clearCanvas}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 sm:flex-none"
          >
            Clear
          </button>
          <button
            onClick={finishRound}
            className="flex-1 rounded-lg bg-black px-4 py-2 font-semibold text-white hover:scale-102 sm:flex-none"
          >
            Submit
          </button>
        </div>
      </div>
    );
  }

  // phase === "done" — side-by-side reveal, plus the option to post for voting
  return (
    <div className="flex flex-col items-center gap-2 p-4 sm:p-8">
      <h2 className="text-lg sm:text-xl dark:text-black">
        Prompt was:{" "}
        <span className="font-bold text-black dark:text-black">
          {challenge.prompt}
        </span>
      </h2>
      <div className="flex w-full w-[540px] flex-col md:flex-row items-center justify-center gap-3 sm:gap-6">
        <div className="flex w-full flex-1 flex-col items-center gap-2 md:w-auto">
          <p className="font-semibold">You</p>
          <img
            src={userDrawingUrl}
            alt="Your drawing"
            className="aspect-square  w-[220px] md:w-[400px] rounded-lg border-2 border-gray-300 bg-white object-contain"
          />
        </div>
        <div className="flex w-full flex-1 flex-col items-center gap-2 md:w-auto">
          <p className="font-semibold">Bingus</p>
          <img
            src={challenge.computerDrawing}
            alt="Bingus's drawing"
            className="aspect-square  w-[220px] md:w-[180px] lg:w-[260] rounded-lg border-2 border-gray-300 bg-white object-contain"
          />
        </div>
      </div>
      <p className="text-lg font-bold text-green-500">
        {" "}
        winner: Bingus 😼{" "}
        <span className="font-normal text-sm">
          {" "}
          <br></br>(bingus always wins lol){" "}
        </span>
      </p>
      {posted ? (
        <p className="text-sm font-medium text-green-600">
          Posted! Other users can view and like your art!.
        </p>
      ) : (
        <p className="text-sm text-gray-500">
          Happy with it? Post it so other users can view it too!
        </p>
      )}

      <div className="flex w-full max-w-[400px] flex-col gap-3 px-2 sm:w-auto sm:flex-row sm:px-0">
        <button
          onClick={playAgain}
          className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-semibold hover:bg-gray-100 sm:flex-none"
        >
          Play Again
        </button>
        <button
          onClick={postForVoting}
          disabled={posted || loading}
          className="flex-1 rounded-lg bg-black px-6 py-3 font-semibold text-white hover:scale-102 disabled:cursor-not-allowed disabled:bg-purple-300 sm:flex-none"
        >
          {loading ? "posting.." : "post"}
        </button>
      </div>
    </div>
  );
}