"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up")
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = sectionRef.current?.querySelectorAll(".animate-on-scroll")
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const handleScrollToTeam = () => {
    const teamSection = document.querySelector("#team")
    if (teamSection) {
      teamSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center py-[100px] overflow-hidden"
    >
      {/* Abstract gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-accent-light/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="max-w-[1100px] mx-auto px-6 text-center">
        <h1 className="animate-on-scroll opacity-0 text-5xl md:text-6xl lg:text-[48px] font-semibold text-primary mb-6 text-balance">
          Welcome to Empty Console
        </h1>

        <p className="animate-on-scroll opacity-0 animate-delay-100 text-lg md:text-xl text-secondary max-w-3xl mx-auto mb-8 leading-relaxed text-pretty">
          Empty Console is a team of students who came together due to their love of programming. From a shared passion,
          the team has evolved into a collaborative space where each member can pursue their unique talents, contribute
          meaningfully to projects, and develop skills while learning from each other.
        </p>

        <p className="animate-on-scroll opacity-0 animate-delay-200 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-pretty">
          Each member brings a unique perspective, balancing technical expertise, creativity, and teamwork to produce
          innovative projects.
        </p>

        <div className="animate-on-scroll opacity-0 animate-delay-300">
          <Button
            onClick={handleScrollToTeam}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium uppercase tracking-wide px-8 py-6 text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Meet the Team
            <ArrowDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
