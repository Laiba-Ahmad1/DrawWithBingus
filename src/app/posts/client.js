"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import rough from "roughjs";

export default function PostsPage({ user }) {
  const bgCanvasRef = useRef(null);
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  //hathched background
  useEffect(() => {
    if (loading) return; // wait until canvas is actually in the DOM
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
  }, [loading]);

  useEffect(() => {
    const loadDrawings = async () => {
      try {
        const res = await fetch("/api/posts");
        const data = await res.json();
        if (res.ok) setDrawings(data.drawings);
      } catch (err) {
        console.error("Failed to load posts:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDrawings();
  }, []);

  const filteredDrawings = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return drawings;

    return drawings.filter((drawing) => {
      const prompt = drawing.prompt?.toLowerCase() ?? "";
      const username = drawing.userId?.name?.toLowerCase() ?? "";
      return prompt.includes(query) || username.includes(query);
    });
  }, [drawings, search]);

  const vote = async (id) => {
    const drawing = drawings.find((d) => d._id === id);
    if (user && drawing?.votedBy?.includes(user._id)) return; // guard client-side too

    try {
      const res = await fetch(`/api/posts?id=${id}`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) return console.error("Vote failed:", data.message);
      setDrawings((prev) => prev.map((d) => (d._id === id ? data.drawing : d)));
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  if (loading) return <p className="p-8 text-center">Loading...</p>;

  return (
    <div className="min-h-screen bg-white">
      <canvas ref={bgCanvasRef} className="fixed inset-0 pointer-events-none" />
      <div
        style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
        className="sticky top-0 z-10 flex justify-center border-b border-gray-200 bg-black p-4 backdrop-blur"
      >
        <div className="flex w-full max-w-md items-center gap-2">
          <Link
            href="/"
            className="shrink-0 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-gray-200"
          >
            go to Home
          </Link>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by prompt or username..."
            aria-label="Search drawings by prompt or username"
            className="min-w-0 flex-1 text-white  border border-gray-300 px-4 py-2 text-sm outline-none focus:border-white focus:ring-2 focus:ring-gray-700"
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 p-4 sm:p-8">
        <h1 className="text-2xl font-bold">Masterpieces of our artists</h1>

        {filteredDrawings.length === 0 && (
          <p className="text-gray-500">
            {search
              ? "No drawings match your search."
              : "No drawings posted yet."}
          </p>
        )}

        <div className="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
          {filteredDrawings.map((d) => {
            const hasVoted = user && d.votedBy?.includes(user._id);

            return (
              <div
                key={d._id}
                className="bg-white flex flex-col items-center gap-3 border border-black border-4 p-4  shadow-black"
                style={{ boxShadow: "8px 8px 0px 0px black", zIndex: 1 }}
              >
                <p>
                  Prompt:{" "}
                  <span className="text-black font-semibold">{d.prompt}</span>
                </p>

                <div className="flex w-full justify-center gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={d.userDrawingUrl}
                      alt="User drawing"
                      className="h-[160px] w-[160px] lg:w-[200px] lg:h-[200px] rounded-lg border-2 border-gray-300 bg-white object-contain"
                    />
                    <div className="flex gap-3.5">
                      <button
                        onClick={() => vote(d._id)}
                        className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                          hasVoted
                            ? "bg-white text-black border-2 border-black"
                            : "bg-black text-white"
                        }`}
                      >
                        Likes ({d.votes.user})
                      </button>{" "}
                      <p>-by {d.userId?.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
