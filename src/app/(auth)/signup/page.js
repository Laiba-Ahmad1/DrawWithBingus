"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: user, email, password, gender }),
        credentials: "include",
      });
      const data = await res.json();
      if (!data.status) {
        setError(data.message || "Something went wrong");
        setLoading(false);
        return;
      }
      toast.success("Account created successfully");
      router.push("/robot");
    } catch (err) {
      console.log(err);
      toast.error("Server error, please try again");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <p className="text-2xl mt-2! font-semibold text-black sm:text-3xl text-center mb-4">
        Create Account
      </p>

      <div className="w-full sm:w-[88%] lg:w-[80%] mx-auto">
        {error && <p className="text-sm text-red-600 -mt-6 mb-2">{error}</p>}

        <div>
          <label className="block text-lg font-semibold text-black mb-1.5 sm:text-[20px]">
            Full Name
          </label>
          <input
            type="text"
            required
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Enter your Full name"
            className="w-full border rounded-xl !px-2 h-10 outline-black border-gray-400 px-3"
          />
        </div>

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
            className="w-full border rounded-xl !px-2 h-10 outline-black border-gray-400 px-3"
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
            className="w-full border rounded-xl !px-2 mb-4 h-10 outline-black border-gray-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-11 text-gray-400 text-sm"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-10">
          <label className="block text-lg font-semibold text-black mb-1.5 sm:text-[20px]">
            Gender
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="w-full border rounded-xl p-3 mb-4 h-15 outline-black border-gray-400 text-gray-500"
          >
            <option value="">-Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded-xl h-10 disabled:opacity-50 hover:bg-gray-800 hover:scale-105 transition-all duration-200 ease-in-out"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <div className="flex items-center">
          <p className="text-gray-500 text-[13px]">
            Already have an account?{" "}
            <Link href="/login" className="text-sm text-black hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}