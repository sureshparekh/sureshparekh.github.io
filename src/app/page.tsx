import ScrollyCanvas from "@/components/ScrollyCanvas";
import Overlay from "@/components/Overlay";
import AcademicProfile from "@/components/AcademicProfile";

export default function Home() {
  return (
    <main className="bg-[#121212] min-h-screen">
      {/* 500vh container for scrollytelling */}
      <div className="relative">
        <ScrollyCanvas />
        <Overlay />
      </div>

      {/* Academic Profile placed conceptually after the scroll finishes */}
      <AcademicProfile />
    </main>
  );
}
