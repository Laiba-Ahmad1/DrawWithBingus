"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!data.status) {
        toast.error(data.message || "Something went wrong");
        setLoading(false);
        return;
      }
      toast.success("Logged in successfully");
      router.push("/");
    } catch (err) {
      console.log(err);
      toast.error("Server error, please try again");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <p className="text-2xl mt-2! font-semibold text-black sm:text-3xl text-center mb-4">
        Login
      </p>

      <div className="w-full sm:w-[88%] lg:w-[80%] mx-auto">
        <div>
          <label className="block text-lg font-semibold text-black mb-1.5 sm:text-[20px]">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full border rounded-xl px-2! h-10 outline-black border-gray-400 px-3"
          />
        </div>

        <div className="relative">
          <label className="block text-lg font-semibold text-black mb-1.5 sm:text-[20px]">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full border rounded-xl px-2! mb-4 h-10 outline-black border-gray-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-11 text-gray-400 text-sm"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
          
            <p onClick={() => toast("Then what can I do? you goldfish brain 🐟")} className="text-black hover:underline">
              Forgot Password?
            </p>
          
        </div>
       
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-33 bg-black text-white rounded-xl h-10 disabled:opacity-50 hover:bg-gray-800 hover:scale-105 transition-all duration-200 ease-in-out"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="flex flex-col gap-5 items-center !mt-3">
          <p className="text-gray-500 text-[13px]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-sm text-black hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}