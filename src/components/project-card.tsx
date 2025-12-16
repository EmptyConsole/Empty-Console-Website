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
    <Card className="group bg-card rounded-2xl shadow-[0_4px_8px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full">
      {image && (
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={`Screenshot of ${title} project`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
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
              <span key={tech} className="px-3 py-1 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 text-xs font-medium rounded-full">
                {isP5js ? (
                  <a
                    href="https://p5js.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-700 dark:text-purple-300 hover:underline"
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
