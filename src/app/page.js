import { getCurrentUser } from "@/lib/getCurrentuser";

export default async function Home() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");
  return (
    <main className="w-screen h-screen overflow-hidden bg-zinc-50">
    <div className="flex flex-col flex-1 items-center justify-center font-sans dark:bg-black">
      <p className="font-main text-5xl">{user.name} vs Bingus</p>
    </div>
    </main>
  );
}
