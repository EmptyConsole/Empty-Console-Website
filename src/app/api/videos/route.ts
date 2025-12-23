import { NextResponse } from "next/server"
import { readdir } from "fs/promises"
import { join } from "path"

export async function GET() {
  try {
    const clipsDirectory = join(process.cwd(), "public", "Clips")
    const files = await readdir(clipsDirectory)
    
    // Filter for video files (mp4, mov, webm, etc.)
    const videoExtensions = [".mp4", ".mov", ".webm", ".avi", ".mkv"]
    const videoFiles = files
      .filter((file) => 
        videoExtensions.some((ext) => file.toLowerCase().endsWith(ext))
      )
      .map((file) => `/Clips/${file}`)
      .sort() // Sort alphabetically for consistent ordering
    
    return NextResponse.json({ videos: videoFiles })
  } catch (error) {
    console.error("Error reading video directory:", error)
    // Fallback to empty array if directory doesn't exist
    return NextResponse.json({ videos: [] })
  }
}

