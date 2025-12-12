import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface ProjectCardProps {
  title: string
  description: string
  learnings: string[]
  technologies: string[]
  image?: string
}

export function ProjectCard({ title, description, learnings, technologies, image }: ProjectCardProps) {
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
        <h4 className="text-xl font-semibold text-primary mb-3">{title}</h4>
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
          {technologies.map((tech) => (
            <span key={tech} className="px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
              {tech}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
