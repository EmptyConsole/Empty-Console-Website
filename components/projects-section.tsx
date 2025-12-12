"use client"

import { useEffect, useRef } from "react"
import { ProjectCard } from "@/components/project-card"

const completedProjects = [
  {
    title: "Malice and Mercy",
    description:
      "A p5.js platformer created for a competitive game jam that earned Honorable Mention. The game explores ethical decision-making in fast-paced platforming. Players choose to save or kill characters while balancing points and time using three throwable abilities. Features a fully custom physics engine, tilemap system, collision detection, particles, and a level editor coded from scratch.",
    learnings: [
      "Building a full game loop",
      "Implementing custom physics",
      "Level design and choice-based gameplay",
      "Teamwork under time pressure",
      "Managing deadlines and collaborating on art and music",
    ],
    technologies: ["p5.js", "JavaScript", "Custom Physics Engine"],
    image: "/2d-pixel-art-platformer-game-screenshot-with-dark-.jpg",
  },
  {
    title: "Space Looper",
    description:
      "A GMTK Game Jam strategy game created in a 4-day jam with 9,645 submissions. Players circle meteors with limited rope and energy, managing resources across 20 research centers. The game challenges players with precise movement mechanics and strategic resource allocation.",
    learnings: [
      "Rapid prototyping",
      "Designing and balancing custom movement and resource systems",
      "Collaboration under tight deadlines",
      "Debugging complex interactions",
      "Iterative design and precise gameplay mechanics",
    ],
    technologies: ["Game Development", "Resource Management Systems"],
    image: "/space-game-with-meteors-and-rope-mechanics-screens.jpg",
  },
  {
    title: "Bugged Out",
    description:
      "Created for the Patch Notes Game Jam with the theme 'The Error is the Feature' in a 3-day jam, placing 17th out of 454 entries. This platformer intentionally uses glitches as core gameplay mechanics, requiring players to use logic, memory, and reflexes to navigate levels.",
    learnings: [
      "Integrating theme into mechanics",
      "Iterative design and refining platformer feel",
      "Playtesting and incorporating user feedback",
      "Improving teamwork coordination",
    ],
    technologies: ["Platformer Mechanics", "Creative Game Design"],
    image: "/glitchy-retro-platformer-game-with-visual-bugs-as-.jpg",
  },
  {
    title: "Open Stage",
    description:
      "A Congressional App Challenge project designed to help musicians earn more revenue via reduced upfront costs and real-time tipping. Empty Console collaborated with local SF Bay Area bands to develop a user-friendly UX and sustainable revenue model. The project placed third in district CA-15.",
    learnings: [
      "Full-stack development",
      "UX design and gathering real user feedback",
      "Sustainable business modeling",
      "Presenting solutions to judges",
      "Creating socially impactful technology",
    ],
    technologies: ["Full-Stack Development", "UX Design", "Business Modeling"],
    image: "/music-streaming-app-interface-for-musicians-with-t.jpg",
  },
]

const currentProjects = [
  {
    title: "FTC Competitive Robotics",
    description:
      "Part of a larger 15-student school team building a PS5-controlled robot for timed challenges. Empty Console handled leadership roles, including task assignment, coordinating subteams, and ensuring progress. The team finished second overall—the school's best result ever.",
    learnings: [
      "Large-team collaboration",
      "Leadership and task delegation",
      "Motivating disengaged members",
      "Mechanical and software integration",
      "Iterative problem-solving",
    ],
    technologies: ["Robotics", "PS5 Controller Integration", "Team Leadership"],
    image: "/ftc-robotics-competition-robot-on-field.jpg",
  },
  {
    title: "Future City Competition",
    description:
      "Empty Console contributes as part of a larger team designing a city model to solve a featured challenge. Tasks include planning, essay writing, model building, and presenting to judges. The project combines technical problem-solving with creative design thinking.",
    learnings: [
      "Collaborative project management",
      "Design thinking",
      "Coordinating complex tasks",
      "Presentation skills",
      "Creative and technical problem-solving",
    ],
    technologies: ["Model Building", "Urban Planning", "Presentation"],
    image: "/futuristic-city-model-architectural-display.jpg",
  },
]

export function ProjectsSection() {
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

  return (
    <section id="projects" ref={sectionRef} className="py-[100px] bg-background">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="animate-on-scroll opacity-0 text-4xl md:text-[32px] font-semibold text-primary mb-4">
            Our Projects
          </h2>
          <p className="animate-on-scroll opacity-0 animate-delay-100 text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore the innovative projects we&apos;ve built and are currently working on
          </p>
        </div>

        {/* Completed Projects */}
        <div className="mb-20">
          <h3 className="animate-on-scroll opacity-0 text-2xl font-semibold text-primary mb-8 flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-500" aria-hidden="true" />
            Completed Projects
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {completedProjects.map((project, index) => (
              <div
                key={project.title}
                className="animate-on-scroll opacity-0"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <ProjectCard {...project} />
              </div>
            ))}
          </div>
        </div>

        {/* Current Projects */}
        <div>
          <h3 className="animate-on-scroll opacity-0 text-2xl font-semibold text-primary mb-8 flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-accent animate-pulse" aria-hidden="true" />
            Current Projects
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {currentProjects.map((project, index) => (
              <div
                key={project.title}
                className="animate-on-scroll opacity-0"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <ProjectCard {...project} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
