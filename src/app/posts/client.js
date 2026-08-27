"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import rough from "roughjs";

export default function PostsPage({ user }) {
  const bgCanvasRef = useRef(null);
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);
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
        const res = await fetch(`/api/posts?sort=${sort}`);
        const data = await res.json();
        if (res.ok) setDrawings(data.drawings);
      } catch (err) {
        console.error("Failed to load posts:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDrawings();
  }, [sort]);

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
    try {
      const res = await fetch(`/api/posts?id=${id}`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) return console.error("Vote failed:", data.message);
      const refreshed = await fetch(`/api/posts?sort=${sort}`);
      const refreshedData = await refreshed.json();
      if (refreshed.ok) setDrawings(refreshedData.drawings);
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  const deletePost = async () => {
    const id = deleteConfirmationId;
    setDeleteConfirmationId(null);
    if (!id) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) return console.error("Delete failed:", data.message);
      setDrawings((prev) => prev.filter((drawing) => drawing._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p className="p-8 text-center">Loading...</p>;

  return (
    <div className="min-h-screen bg-white">
      <canvas ref={bgCanvasRef} className="fixed inset-0 pointer-events-none" />
      {deleteConfirmationId && (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={() => setDeleteConfirmationId(null)}
        >
          <div
            className="w-full max-w-sm border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_black]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-dialog-title" className="text-xl font-bold">
              Delete this post?
            </h2>
            <p className="mt-2 text-gray-700">This action cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmationId(null)}
                className="border-2 border-black px-4 py-2 font-semibold text-black hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deletePost}
                className="bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-900"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
        className="sticky top-0 z-10 flex justify-center border-b border-gray-200 bg-black p-4 backdrop-blur"
      >
        <div className="flex w-full max-w-2xl items-center gap-2">
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

          <label className="hidden shrink-0 sm:block">
            <span className="sr-only">View posts by</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="View posts by"
              className="border border-white bg-black px-3 py-2 text-sm font-semibold text-white outline-none focus:ring-2 focus:ring-gray-700"
            >
              <option value="recent">Recently posted</option>
              <option value="likes">Highest likes</option>
            </select>
          </label>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 p-4 sm:p-8">
        <div className="flex items-center gap-3">
          <label className="shrink-0 sm:hidden">
            <span className="sr-only">View posts by</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="View posts by"
              className="border border-black bg-white px-2 py-2 text-sm font-semibold text-black outline-none focus:ring-2 focus:ring-gray-700"
            >
              <option value="recent">Recent</option>
              <option value="likes">Top likes</option>
            </select>
          </label>
          <h1 className="text-2xl font-bold">Masterpieces of our artists</h1>
        </div>

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
            const canDelete = user && d.userId?._id === user._id;

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
                    <div className="flex flex-wrap items-center justify-center gap-3.5">
                      <button
                        onClick={() => vote(d._id)}
                        className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                          hasVoted
                            ? "bg-white text-black border-2 border-black"
                            : "bg-black text-white"
                        }`}
                      >
                        Likes ({d.votes.user})
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => setDeleteConfirmationId(d._id)}
                          disabled={deletingId === d._id}
                          className="border-2  bg-red-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-white  hover:bg-red-900 transition-colors   disabled:cursor-wait disabled:opacity-50"
                        >
                          {deletingId === d._id ? "Deleting..." : "Delete"}
                        </button>
                      )}
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
