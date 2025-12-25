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
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [videoOpacity, setVideoOpacity] = useState(0)

  const SKIP_START = 1.5
  const SKIP_END = 1.5
  const FADE_DURATION = 0.75

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
          const shuffled = shuffleArray(data.videos as string[])
          setVideoList(shuffled)
          console.log("Videos loaded:", shuffled)
        } else {
          console.warn("No videos found in API response")
          useFallbackVideos()
        }
      } catch (error) {
        console.error("Error fetching videos:", error)
        useFallbackVideos()
      }
    }

    const useFallbackVideos = () => {
      const fallbackVideos = [
        "/Clips/OpenStage.mp4",
        "/Clips/SpaceLooper.mp4",
        "/Clips/BuggedOut.mp4",
        "/Clips/MaliceAndMercy.mp4",
      ]
      const shuffled = shuffleArray(fallbackVideos)
      setVideoList(shuffled)
      console.log("Using fallback videos:", shuffled)
    }

    fetchVideos()
  }, [])

  // Handle video playback with skip logic
  useEffect(() => {
    const video = videoRef.current
    if (!video || videoList.length === 0) return
    setIsVideoReady(false)
    setVideoOpacity(0)
    let isTransitioning = false

    // Apply opacity fade for the first/last 0.75s of playable segment (after skips)
    const updateVideoOpacity = () => {
      if (!video.duration) {
        setVideoOpacity(0)
        return
      }

      const playableStart = SKIP_START
      const playableEnd = video.duration - SKIP_END

      // If the video is too short after skips, keep it fully visible
      if (playableEnd - playableStart <= FADE_DURATION * 2) {
        setVideoOpacity(1)
        return
      }

      const fadeInEnd = playableStart + FADE_DURATION
      const fadeOutStart = playableEnd - FADE_DURATION
      const current = video.currentTime

      let nextOpacity = 1

      if (current < playableStart) {
        nextOpacity = 0
      } else if (current <= fadeInEnd) {
        nextOpacity = Math.min(1, Math.max(0, (current - playableStart) / FADE_DURATION))
      } else if (current >= fadeOutStart) {
        nextOpacity = Math.min(1, Math.max(0, (playableEnd - current) / FADE_DURATION))
      } else {
        nextOpacity = 1
      }

      setVideoOpacity((prev) => (Math.abs(prev - nextOpacity) > 0.01 ? nextOpacity : prev))
    }

    // Ensure video starts at SKIP_START and doesn't go beyond duration - SKIP_END
    const enforceTimeBounds = () => {
      if (!video.duration) return
      
      // If video is too short, just play it normally
      if (video.duration <= SKIP_START + SKIP_END) {
        return
      }

      // Ensure we don't play the first 1.5 seconds
      if (video.currentTime < SKIP_START) {
        video.currentTime = SKIP_START
      }

      // Ensure we don't play the last 1.5 seconds
      if (video.currentTime >= video.duration - SKIP_END) {
        isTransitioning = true
        const nextIndex = (currentVideoIndex + 1) % videoList.length
        console.log("Reached end threshold, moving to next video:", nextIndex)
        setCurrentVideoIndex(nextIndex)
      }
    }

    const handleLoadedMetadata = () => {
      if (video.duration && video.duration > SKIP_START + SKIP_END) {
        video.currentTime = SKIP_START
      }
      setIsVideoReady(true)
      updateVideoOpacity()
      console.log("Video metadata loaded, duration:", video.duration)
    }

    const handleSeeked = () => {
      // Ensure we're still within bounds after seeking
      enforceTimeBounds()
      updateVideoOpacity()
    }

    const handleCanPlay = async () => {
      isTransitioning = false
      // Ensure we start at SKIP_START
      if (video.duration && video.duration > SKIP_START + SKIP_END) {
        if (video.currentTime < SKIP_START) {
          video.currentTime = SKIP_START
        }
      }
      updateVideoOpacity()
      console.log("Video can play")
      try {
        await video.play()
        console.log("Video playing successfully")
      } catch (error) {
        console.error("Error playing video:", error)
        setTimeout(() => {
          video.play().catch(e => console.error("Retry failed:", e))
        }, 100)
      }
    }

    const handleLoadedData = () => {
      // Ensure we start at SKIP_START
      if (video.duration && video.duration > SKIP_START + SKIP_END) {
        if (video.currentTime < SKIP_START) {
          video.currentTime = SKIP_START
        }
      }
      updateVideoOpacity()
      if (video.paused) {
        video.play().catch(e => console.error("Play on loaded data failed:", e))
      }
    }

    const handleTimeUpdate = () => {
      if (isTransitioning) return
      enforceTimeBounds()
      updateVideoOpacity()
    }

    const handleEnded = () => {
      if (!isTransitioning) {
        isTransitioning = true
        const nextIndex = (currentVideoIndex + 1) % videoList.length
        console.log("Video ended, moving to:", nextIndex)
        setCurrentVideoIndex(nextIndex)
      }
    }

    const handleError = (e: Event) => {
      console.error("Video error:", e, video.error)
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("seeked", handleSeeked)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("loadeddata", handleLoadedData)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("ended", handleEnded)
    video.addEventListener("error", handleError)

    video.load()
    updateVideoOpacity()
    
    const playTimeout = setTimeout(() => {
      if (video.paused && video.readyState >= 2) {
        // Ensure we start at SKIP_START before playing
        if (video.duration && video.duration > SKIP_START + SKIP_END) {
          if (video.currentTime < SKIP_START) {
            video.currentTime = SKIP_START
          }
        }
        video.play().catch(e => console.error("Delayed play failed:", e))
      }
    }, 500)

    return () => {
      clearTimeout(playTimeout)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("seeked", handleSeeked)
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("loadeddata", handleLoadedData)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("ended", handleEnded)
      video.removeEventListener("error", handleError)
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
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .hero-text {
          color: black;
        }
        .hero-text-h1 {
          text-shadow: -4px -4px 0 white, 4px -4px 0 white, -4px 4px 0 white, 4px 4px 0 white, -4px 0 0 white, 4px 0 0 white, 0 -4px 0 white, 0 4px 0 white, -3px -3px 0 white, 3px -3px 0 white, -3px 3px 0 white, 3px 3px 0 white, -3px 0 0 white, 3px 0 0 white, 0 -3px 0 white, 0 3px 0 white, -2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white, 2px 2px 0 white, -2px 0 0 white, 2px 0 0 white, 0 -2px 0 white, 0 2px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white, -1px 0 0 white, 1px 0 0 white, 0 -1px 0 white, 0 1px 0 white;
        }
        .hero-text-p {
          text-shadow: -2.5px -2.5px 0 white, 2.5px -2.5px 0 white, -2.5px 2.5px 0 white, 2.5px 2.5px 0 white, -2.5px 0 0 white, 2.5px 0 0 white, 0 -2.5px 0 white, 0 2.5px 0 white, -1.5px -1.5px 0 white, 1.5px -1.5px 0 white, -1.5px 1.5px 0 white, 1.5px 1.5px 0 white, -1.5px 0 0 white, 1.5px 0 0 white, 0 -1.5px 0 white, 0 1.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white, 0.5px 0.5px 0 white, -0.5px 0 0 white, 0.5px 0 0 white, 0 -0.5px 0 white, 0 0.5px 0 white;
        }
        .hero-text-p2 {
          text-shadow: -1.5px -1.5px 0 white, 1.5px -1.5px 0 white, -1.5px 1.5px 0 white, 1.5px 1.5px 0 white, -1.5px 0 0 white, 1.5px 0 0 white, 0 -1.5px 0 white, 0 1.5px 0 white, -0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white, 0.5px 0.5px 0 white, -0.5px 0 0 white, 0.5px 0 0 white, 0 -0.5px 0 white, 0 0.5px 0 white;
        }
      `}} />
      <section
        id="home"
        ref={sectionRef}
        className="relative min-h-screen flex items-center justify-center py-[100px] pt-[72px] overflow-hidden"
        style={{ background: 'transparent' }}
      >
      {/* Video background - positioned below header - hidden on mobile, visible on desktop */}
      {videoList.length > 0 && videoList[currentVideoIndex] && (
        <video
          ref={videoRef}
          className="hidden md:block absolute left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[calc(100vh-72px)] object-contain"
          style={{ 
            zIndex: 0,
            opacity: isVideoReady ? videoOpacity : 0,
            transition: 'opacity 0.2s linear',
            top: '72px'
          }}
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
      <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[calc(100vh-72px)] bg-background/40" style={{ zIndex: 1, top: '72px' }} />

      {/* Abstract gradient background overlay */}
      <div className="absolute inset-0" style={{ zIndex: 2 }}>
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-accent-light/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="max-w-[1100px] mx-auto px-6 text-center" style={{ position: 'relative', zIndex: 10 }}>
        <h1 
          className="animate-on-scroll text-5xl md:text-6xl lg:text-[48px] font-semibold mb-6 text-balance hero-text hero-text-h1"
        >
          Welcome to Empty Console
        </h1>

        <p 
          className="animate-on-scroll animate-delay-100 text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed text-pretty hero-text hero-text-p"
        >
          Empty Console is a team of students who came together due to their love of programming. From a shared passion,
          the team has evolved into a collaborative space where each member can pursue their unique talents, contribute
          meaningfully to projects, and develop skills while learning from each other. Everyone on the team brings a 
          unique perspective, balancing technical expertise, creativity, and teamwork to produce innovative projects and 
          products, all while learning more about video coding and of the world's future.
        </p>

        {/* <p 
          className="animate-on-scroll animate-delay-200 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed text-pretty hero-text hero-text-p2"
        >
          Each member brings a unique perspective, balancing technical expertise, creativity, and teamwork to produce
          innovative projects.
        </p> */}

        <div className="animate-on-scroll animate-delay-300">
          <Button
            onClick={handleScrollToTeam}
            className="bg-accent hover:bg-accent/95 active:bg-accent/92 text-accent-foreground font-medium uppercase tracking-wide px-10 py-7 text-base rounded-2xl shadow-lg hover:shadow-2xl active:shadow-md transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 transform"
          >
            Meet the Team <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v18" />
              <path d="M6 14l6 6 6-6" />
            </svg>
          </Button>
        </div>
      </div>
    </section>
    </>
  )
}