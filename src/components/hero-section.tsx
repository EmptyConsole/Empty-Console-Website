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
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const isCrossfadingRef = useRef(false)
  const [videoList, setVideoList] = useState<string[]>([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [activeLayer, setActiveLayer] = useState<0 | 1>(0)
  const [layerSources, setLayerSources] = useState<(string | null)[]>([null, null])
  const [layerOpacity, setLayerOpacity] = useState<[number, number]>([0, 0])
  const [pendingVideoIndex, setPendingVideoIndex] = useState<number | null>(null)

  const SKIP_START = 1.5
  const SKIP_END = 1.5
  const CROSSFADE_DURATION = 0.6

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

  const setOpacityForLayer = (layer: 0 | 1, value: number) => {
    setLayerOpacity((prev) => {
      const next = [...prev] as [number, number]
      next[layer] = value
      return next
    })
  }

  const ensureWithinPlayableRange = (video: HTMLVideoElement | null) => {
    if (!video || !video.duration) return
    if (video.duration <= SKIP_START + SKIP_END) return
    if (video.currentTime < SKIP_START) {
      video.currentTime = SKIP_START
    }
  }

  const queueNextVideo = () => {
    if (videoList.length <= 1) return
    if (pendingVideoIndex !== null) return
    const targetLayer: 0 | 1 = activeLayer === 0 ? 1 : 0
    const nextIndex = (currentVideoIndex + 1) % videoList.length
    setPendingVideoIndex(nextIndex)
    setLayerSources((prev) => {
      const next = [...prev]
      next[targetLayer] = videoList[nextIndex]
      return next
    })
    setOpacityForLayer(targetLayer, 0)
  }

  const startCrossfade = (nextLayer: 0 | 1, targetIndex: number) => {
    if (isCrossfadingRef.current) return
    isCrossfadingRef.current = true

    const currentLayer = activeLayer
    const incomingVideo = videoRefs.current[nextLayer]
    const outgoingVideo = videoRefs.current[currentLayer]

    if (incomingVideo) {
      ensureWithinPlayableRange(incomingVideo)
      incomingVideo.play().catch((e) => console.error("Error playing next video:", e))
    }

    setLayerOpacity((prev) => {
      const next = [...prev] as [number, number]
      next[nextLayer] = 1
      next[currentLayer] = 0
      return next
    })

    setTimeout(() => {
      if (outgoingVideo && !outgoingVideo.paused) {
        outgoingVideo.pause()
      }
      setActiveLayer(nextLayer)
      setCurrentVideoIndex(targetIndex)
      setPendingVideoIndex(null)
      isCrossfadingRef.current = false
    }, CROSSFADE_DURATION * 1000)
  }

  const handleLoadedMetadata = (layer: 0 | 1) => {
    const video = videoRefs.current[layer]
    if (!video) return
    if (video.duration && video.duration > SKIP_START + SKIP_END) {
      video.currentTime = SKIP_START
    }
  }

  const handleCanPlay = (layer: 0 | 1) => {
    const video = videoRefs.current[layer]
    if (!video) return
    ensureWithinPlayableRange(video)
    video.play().catch((e) => console.error("Error playing video:", e))

    if (pendingVideoIndex !== null && layerSources[layer] === videoList[pendingVideoIndex]) {
      startCrossfade(layer, pendingVideoIndex)
    } else if (layer === activeLayer && layerOpacity[layer] === 0) {
      setOpacityForLayer(layer, 1)
    }
  }

  const handleTimeUpdate = (layer: 0 | 1) => {
    if (layer !== activeLayer) return
    const video = videoRefs.current[layer]
    if (!video || !video.duration) return
    ensureWithinPlayableRange(video)

    if (pendingVideoIndex === null) {
      const remaining = video.duration - video.currentTime
      if (remaining <= SKIP_END + CROSSFADE_DURATION) {
        queueNextVideo()
      }
    }
  }

  const handleEnded = (layer: 0 | 1) => {
    if (layer !== activeLayer) return
    const video = videoRefs.current[layer]
    if (videoList.length <= 1) {
      if (video) {
        ensureWithinPlayableRange(video)
        video.play().catch((e) => console.error("Loop play failed:", e))
      }
      return
    }
    queueNextVideo()
  }

  const handleError = (layer: 0 | 1, e: Event) => {
    const video = videoRefs.current[layer]
    console.error("Video error:", e, video?.error)
  }

  useEffect(() => {
    if (videoList.length === 0) return
    setLayerSources((prev) => {
      if (prev[activeLayer] === videoList[currentVideoIndex]) return prev
      const next = [...prev]
      next[activeLayer] = videoList[currentVideoIndex]
      return next
    })
  }, [videoList, activeLayer, currentVideoIndex])

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
      {[0, 1].map((layer) => {
        const typedLayer = layer as 0 | 1
        const source = layerSources[typedLayer]
        if (!source) return null

        return (
          <video
            key={`video-layer-${typedLayer}-${source}`}
            ref={(node) => {
              videoRefs.current[typedLayer] = node
            }}
            className="hidden md:block absolute left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[calc(100vh-72px)] object-contain"
            style={{ 
              zIndex: 0,
              opacity: layerOpacity[typedLayer],
              transition: `opacity ${CROSSFADE_DURATION}s linear`,
              top: '72px',
              pointerEvents: 'none'
            }}
            muted
            playsInline
            autoPlay
            loop={false}
            preload="auto"
            src={source}
            onLoadedMetadata={() => handleLoadedMetadata(typedLayer)}
            onCanPlay={() => handleCanPlay(typedLayer)}
            onTimeUpdate={() => handleTimeUpdate(typedLayer)}
            onEnded={() => handleEnded(typedLayer)}
            onError={(e) => handleError(typedLayer, e.nativeEvent)}
          />
        )
      })}

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