"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { TeamMemberCard } from "@/components/team-member-card"

const teamMembers = [
  {
    name: "HF_ang",
    role: "Co-Founder",
    // Hidden logo image before HF_ang's picture
    image: "/HF_ang PFP.png",
    // image: "/BetterEmptyConsoleLogo.png",
    bio: "HF_ang discovered coding through video games and has since developed a passion for problem-solving, creating digital art, and experimenting with physics in code. As the main programmer and artist, he brings both technical expertise and creative vision to every project.",
    hobbies: [
      { icon: "🎾", label: "Tennis" },
      { icon: "🏓", label: "Ping-pong" },
      { icon: "⛵", label: "Sailing" },
    ],
    discord: "hfanggamedev",
  },
  {
    name: "ShyGuy",
    role: "Co-Founder",
    image: "/images (1).jpeg",
    bio: "ShyGuy handles marketing, presentations, communications, and programming. He discovered technology at a young age and has developed strong skills in leadership and strategy. His ability to coordinate and communicate effectively makes him essential to the team's success.",
    hobbies: [
      { icon: "🎾", label: "Tennis" },
      { icon: "⛳", label: "Golf" },
      { icon: "⛵", label: "Sailing" },
      { icon: "🎹", label: "Piano" },
    ],
    discord: "shyguygamedev",
  },
  {
    name: "Emey",
    role: "Co-Founder",
    image: "/pixilart-1766028338678.png",
    bio: "Emey is the music composer and and an artist on the team. He began coding later than the other members but learned extremely quickly. He enjoys exploring the intersection of music, art, and programming, bringing a unique audio-visual perspective to the team's projects.",
    hobbies: [
      { icon: "🎾", label: "Tennis" },
      { icon: "🎹", label: "Piano" },
    ],
    discord: "qorachniuphorbia",
  },
]

export function TeamSection() {
  const sectionRef = useRef<HTMLElement>(null)

  // Preload BetterEmptyConsoleLogo.png before HF_ang's picture
  useEffect(() => {
    const img = new window.Image()
    img.src = "/BetterEmptyConsoleLogo.png"
  }, [])

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

  return (
    <section id="team" ref={sectionRef} className="py-[100px] bg-card">
      {/* Hidden logo image before HF_ang's picture */}
      <div className="opacity-0 w-0 h-0 overflow-hidden pointer-events-none fixed -z-10">
        <Image
          src="/BetterEmptyConsoleLogo.png"
          alt=""
          width={1}
          height={1}
          loading="eager"
          unoptimized
        />
      </div>
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="animate-on-scroll opacity-0 text-4xl md:text-[32px] font-semibold text-primary mb-4">
            Who Is Empty Console
          </h2>
          <p className="animate-on-scroll opacity-0 animate-delay-100 text-lg text-muted-foreground max-w-2xl mx-auto">
            Meet the talented individuals behind our innovative projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={member.name}
              className={`animate-on-scroll opacity-0 animate-delay-${(index + 1) * 100} flex`}
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <TeamMemberCard {...member} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
