"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="absolute top-3 right-4 z-30 shrink-0 animate-fade-in-button rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-white hover:text-black hover:border-2 hover:border-black"
    >
      Logout
    </button>
  );
}