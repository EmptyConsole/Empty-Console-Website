"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"

// Shuffle array function
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoList, setVideoList] = useState<string[]>([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  // Fetch video list from API (automatically detects all videos in /public/Clips)
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/api/videos")
        if (!response.ok) {
          throw new Error("Failed to fetch videos")
        }
        const data = await response.json()
        if (data.videos && data.videos.length > 0) {
          // Shuffle the videos for random order
          setVideoList(shuffleArray(data.videos))
        } else {
          console.warn("No videos found in API response")
        }
      } catch (error) {
        console.error("Error fetching videos:", error)
        // Fallback to hardcoded list if API fails
        const fallbackVideos = [
          "/Clips/OpenStage.mp4",
          "/Clips/SpaceLooper.mp4",
          "/Clips/BuggedOut.mp4",
          "/Clips/MaliceAndMercy.mp4",
        ]
        setVideoList(shuffleArray(fallbackVideos))
      }
    }
    fetchVideos()
  }, [])

  // Handle video playback with skip logic
  useEffect(() => {
    const video = videoRef.current
    if (!video || videoList.length === 0) return

    const SKIP_START = 1.5 // seconds
    const SKIP_END = 1.5 // seconds
    let isTransitioning = false

    const handleLoadedMetadata = () => {
      // Set start time to skip first 1.5 seconds
      if (video.duration && video.duration > SKIP_START + SKIP_END) {
        video.currentTime = SKIP_START
      }
    }

    const handleCanPlay = async () => {
      isTransitioning = false
      // Start playing when video is ready
      try {
        await video.play()
      } catch (error) {
        console.error("Error playing video:", error)
        // Try again after a short delay
        setTimeout(() => {
          video.play().catch(console.error)
        }, 100)
      }
    }

    const handleLoadedData = () => {
      // Also try to play when data is loaded
      if (video.paused) {
        video.play().catch(console.error)
      }
    }

    const handleTimeUpdate = () => {
      if (
        !isTransitioning &&
        video.duration &&
        video.currentTime >= video.duration - SKIP_END
      ) {
        // If we've reached the last 1.5 seconds, move to next video
        isTransitioning = true
        const nextIndex = (currentVideoIndex + 1) % videoList.length
        setCurrentVideoIndex(nextIndex)
      }
    }

    const handleEnded = () => {
      if (!isTransitioning) {
        isTransitioning = true
        const nextIndex = (currentVideoIndex + 1) % videoList.length
        setCurrentVideoIndex(nextIndex)
      }
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("loadeddata", handleLoadedData)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("ended", handleEnded)

    // Ensure video loads and plays
    video.load()
    
    // Force play attempt after load
    const playTimeout = setTimeout(() => {
      if (video.paused && video.readyState >= 2) {
        video.play().catch(console.error)
      }
    }, 500)

    return () => {
      clearTimeout(playTimeout)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("loadeddata", handleLoadedData)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("ended", handleEnded)
    }
  }, [videoList, currentVideoIndex])

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
      {/* Video background */}
      {videoList.length > 0 && videoList[currentVideoIndex] && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover -z-20"
          muted
          playsInline
          autoPlay
          loop={false}
          preload="auto"
          src={videoList[currentVideoIndex]}
          key={`video-${currentVideoIndex}-${videoList[currentVideoIndex]}`}
        />
      )}

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 -z-10 bg-background/20" />

      {/* Abstract gradient background overlay */}
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
