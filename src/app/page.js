import { getCurrentUser } from "@/lib/getCurrentuser";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="w-screen h-screen overflow-hidden bg-white flex flex-col">
      <div className="absolute w-screen h-screen flex items-center justify-center min-h-screen z-20 animate-pop-in">
        <img
          src="/VS.png"
          alt="vs"
          className="w-[100px] md:w-[300px] lg:w-[350px]"
        />
      </div>

      <div className="absolute w-screen h-screen flex justify-center items-center z-10 animate-fade-in hidden md:block">
        <img
          src="/LineHome.png"
          alt="Description"
          className=" w-full h-full object-contain sm:object-cover  block sm:hidden md:block "
        />
      </div>
      <div className="absolute w-screen h-screen flex justify-center items-center z-10 animate-fade-in md:hidden">
        <img
          src="/LineHome.png"
          alt="Description"
          className=" w-full h-full object-contain sm:object-cover  block sm:hidden md:block "
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-around items-center sm:items-stretch gap-1 sm:gap-20 flex-1 ">
        <div className="absolute top-2 left-2 w-[240px] h-[380px] flex flex-col items-start sm:static sm:w-[400px] sm:h-148 animate-slide-in-left">
          <p className="font-bold text-5xl mb-3 md:mb-0 md:mt-4">Bingus</p>
          <img
            src="/bingusHome.png"
            alt="Description"
            className="w-full h-full object-contain sm:object-cover object-top"
          />
        </div>

        <div className="absolute bottom-2 right-2 w-[240px] h-[380px] flex flex-col items-end z-10 sm:static sm:w-auto sm:h-[700px] mt-0 sm:mt-40 animate-slide-in-right">
          <p className="font-bold text-5xl mb-3 md:mb-0">{user.name}</p>
          <img
            src="/manHome.png"
            alt="Description"
            className="w-full h-full object-contain sm:object-cover"
          />
        </div>
      </div>

      <div className="absolute w-screen h-screen flex flex-col gap-1.5 items-center justify-end pb-10 animate-fade-in-button z-20">
        <Link
          className="flex items-center justify-center w-1/2 lg:h-[60px] md:w-[300px] bg-black text-white rounded-xl h-10 disabled:opacity-50 text-2xl hover:bg-white hover:text-black hover:border-2 hover:scale-105 transition-all duration-200 ease-in-out"
          href="/challenge"
        >
          Start Challenge
        </Link>
        <Link
          className="flex items-center justify-center w-1/2 lg:h-[60px] md:w-[300px] bg-black text-white rounded-xl h-10 disabled:opacity-50 text-2xl hover:bg-white hover:text-black hover:border-2 hover:scale-105 transition-all duration-200 ease-in-out"
          href="/posts"
        >
          Art Gallery
        </Link>
      </div>
    </main>
  );
}
