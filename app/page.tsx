import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { TeamSection } from "@/components/team-section"
import { ProjectsSection } from "@/components/projects-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <TeamSection />
      <ProjectsSection />
      <Footer />
    </main>
  )
}
