import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import type React from "react"

interface ProjectCardProps {
  title: string
  description: string | React.ReactNode
  learnings: string[]
  technologies: string[]
  image?: string
  url?: string
}

export function ProjectCard({ title, description, learnings, technologies, image, url }: ProjectCardProps) {
  return (
    <Card className="group bg-card rounded-2xl shadow-[0_4px_8px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full pt-0">
      <div className="relative w-full aspect-video overflow-hidden rounded-t-2xl">
        <Image
          src={image || "/coming-soon.svg"}
          alt={image ? `Screenshot of ${title} project` : "Coming Soon"}
          fill
          className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <CardContent className="p-6">
        <h4 className="text-xl font-semibold text-primary mb-3">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {title}
            </a>
          ) : (
            title
          )}
        </h4>
        <p className="text-base text-secondary leading-relaxed mb-4">{description}</p>

        <div className="mb-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">Key Learnings</p>
          <ul className="list-disc list-inside space-y-1">
            {learnings.map((learning) => (
              <li key={learning} className="text-sm text-secondary">
                {learning}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          {technologies.map((tech) => {
            const isP5js = tech === "p5.js"
            return (
              <span key={tech} className="px-3 py-1 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 text-xs font-medium rounded-full">
                {isP5js ? (
                  <a
                    href="https://p5js.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-700 dark:text-yellow-300 hover:underline"
                  >
                    {tech}
                  </a>
                ) : (
                  tech
                )}
              </span>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
