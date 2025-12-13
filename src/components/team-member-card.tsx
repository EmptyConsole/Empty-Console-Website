import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface TeamMemberCardProps {
  name: string
  role: string
  image: string
  bio: string
  hobbies: { icon: string; label: string }[]
}

export function TeamMemberCard({ name, role, image, bio, hobbies }: TeamMemberCardProps) {
  return (
    <Card className="group bg-background rounded-2xl shadow-[0_4px_8px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden shadow-md">
            <Image
              src={image || "/placeholder.svg"}
              alt={`Portrait of ${name}, ${role} at Empty Console`}
              fill
              className="object-cover"
              loading="lazy"
            />
          </div>

          <h3 className="text-2xl font-semibold text-primary mb-1">{name}</h3>
          <p className="text-sm font-medium text-accent mb-4">{role}</p>

          <p className="text-base text-secondary leading-relaxed mb-6">{bio}</p>

          <div className="w-full">
            <p className="text-sm font-medium text-muted-foreground mb-3">Hobbies</p>
            <div className="flex flex-wrap justify-center gap-2">
              {hobbies.map((hobby) => (
                <span
                  key={hobby.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-sm text-secondary"
                  role="listitem"
                >
                  <span aria-hidden="true">{hobby.icon}</span>
                  <span>{hobby.label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
