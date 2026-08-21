import { getCurrentUser } from "@/lib/getCurrentuser";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="w-screen h-screen overflow-hidden bg-zinc-50 flex flex-col">
      
      
      
      <div className="absolute w-screen h-screen flex items-center justify-center min-h-screen z-10" ><img src="/VS.png" alt="vs" className="w-[100px] md:w-[300px] lg:w-[350px]"/></div>
      <img src="/LineHome.png" alt="Description" className=" absolute w-full h-full object-contain sm:object-cover object-top hidden md:block " />
      
      <div className="absolute w-full h-full flex items-center justify-center"><img src="/LineHomeMob.png" alt="line" className="block md:hidden sm:hidden top-1/2"></img></div>
     
      <div className="flex flex-col sm:flex-row justify-around items-center sm:items-stretch gap-1 sm:gap-20 flex-1 ">
        <div className="w-[160px] h-[180px] flex flex-col items-start sm:w-[400px] sm:h-148">
          <p className="font-bold text-5xl mb-3 md:mb-0 md:mt-4">Bingus</p>
          <img
            src="/bingusHome.png"
            alt="Description"
            className="w-full h-full object-contain sm:object-cover object-top"
          />
        </div>
        
        <div className="w-[160px] h-[220px] flex flex-col items-end z-10 sm:w-auto sm:h-[700px] mt-0 sm:mt-40">
          <p className="font-bold text-5xl mb-3 md:mb-0">{user.name}</p>
          <img
            src="/manHome.png"
            alt="Description"
            className="w-full h-full object-contain sm:object-cover"
          />
        </div>
      </div>
    </main>
  );
}