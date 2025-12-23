import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { TeamSection } from "@/components/team-section"
import { ProjectsSection } from "@/components/projects-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Logo image for social media previews - hidden but with proper dimensions for crawlers */}
      <div className="absolute left-[-9999px] w-[1200px] h-[630px] opacity-0 pointer-events-none">
        <Image
          src="/BetterEmptyConsoleLogo.png"
          alt="Empty Console Logo"
          width={1200}
          height={630}
          priority
          unoptimized
        />
      </div>
      <Navigation />
      <HeroSection />
      <TeamSection />
      <ProjectsSection />
      <Footer />
    </main>
  )
}
