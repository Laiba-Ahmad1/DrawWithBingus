"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function PostsPage({ user }) {
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [votedIds, setVotedIds] = useState(new Set());

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
  const vote = async (id, votedFor) => {
    if (votedIds.has(id)) return;

    try {
      const res = await fetch(`/api/posts?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votedFor }),
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("Vote failed:", data.message);
        return;
      }

      setDrawings((prev) => prev.map((d) => (d._id === id ? data.drawing : d)));
      setVotedIds((prev) => new Set(prev).add(id));
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  if (loading) return <p className="p-8 text-center">Loading...</p>;

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 flex justify-center border-b border-gray-200 bg-white/95 p-4 backdrop-blur">
        <div className="flex w-full max-w-md items-center gap-2">
          <Link
            href="/"
            className="shrink-0 rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            go to Home
          </Link>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by prompt or username..."
            aria-label="Search drawings by prompt or username"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 p-4 sm:p-8">
        <h1 className="text-2xl font-bold">Vote on drawings</h1>

        {filteredDrawings.length === 0 && (
          <p className="text-gray-500">
            {search
              ? "No drawings match your search."
              : "No drawings posted yet."}
          </p>
        )}

        <div className="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
          {filteredDrawings.map((d) => {
            const hasVoted = votedIds.has(d._id);

            return (
              <div
                key={d._id}
                className="flex flex-col items-center gap-3 border border-black border-4 p-4  shadow-black"
              >
                <p>
                  Prompt:{" "}
                  <span className="text-black font-semibold">{d.prompt}</span>
                </p>

                <div className="flex w-full justify-center gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <p>{d.userId?.name}</p>
                    <img
                      src={d.userDrawingUrl}
                      alt="User drawing"
                      className="h-[160px] w-[160px] rounded-lg border-2 border-gray-300 bg-white object-contain"
                    />
                    <button
                      onClick={() => vote(d._id, "user")}
                      disabled={hasVoted}
                      className="rounded-lg bg-purple-600 px-4 py-1.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-purple-300"
                    >
                      Vote ({d.votes.user})
                    </button>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <p>bingus</p>
                    <img
                      src={d.computerDrawingUrl}
                      alt="Bingus drawing"
                      className="h-[160px] w-[160px] rounded-lg border-2 border-gray-300 bg-white object-contain"
                    />
                    <button
                      onClick={() => vote(d._id, "computer")}
                      disabled={hasVoted}
                      className="rounded-lg bg-black px-4 py-1.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      Vote ({d.votes.computer})
                    </button>
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
