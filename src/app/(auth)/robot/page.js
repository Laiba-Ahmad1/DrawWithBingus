"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function RobotPage() {
    const [answer, setAnswer] = useState("");
    const router = useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (answer.toLowerCase() === "bingus" || answer.toLowerCase() === "bingus the cat") {
            toast.success("Correct! You are not a robot.");
            router.push("/login");
        } else {
            toast.error("Incorrect answer, you nasty ROBOT 😡");
        }
    };

  return (
    <main className="flex justify-center items-center flex-col gap-30"> 
    <h1 className="font-main font-bold text-5xl">Verify you are not a robot :-3</h1>
    <div>
        <form onSubmit={handleSubmit}>
    <label className="text-2xl">Question: Who is the best cat in the entire Universe?</label>
    <input
            type="text"
            required
            placeholder="Enter your answer"
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full border-3 !px-2 h-10 outline-black border-black px-3"
          />
    <button
    type="submit"
    className="mt-4 w-[30%] bg-black text-white rounded-xl h-10 disabled:opacity-50  hover:scale-105 transition-all duration-200 ease-in-out"
    >Submit 🥰</button>
    </form>
    </div>
    </main>
  );
}
