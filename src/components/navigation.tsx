"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#team", label: "Who Is Empty Console" },
  { href: "#projects", label: "Projects" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isProjectsDropdownOpen, setIsProjectsDropdownOpen] = useState(false)
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current)
      }
    }
  }, [])

  const handleProjectsMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
      dropdownTimeoutRef.current = null
    }
    setIsProjectsDropdownOpen(true)
  }

  const handleProjectsMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsProjectsDropdownOpen(false)
    }, 150)
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsOpen(false)
    setIsProjectsDropdownOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-card/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className="max-w-[1100px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, "#home")}
            className="text-xl font-semibold text-primary hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-md px-3 -mx-3 -my-4 py-4 h-full block"
          >
            Empty Console
          </a>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              if (link.label === "Projects") {
                return (
                  <li
                    key={link.href}
                    className="relative"
                    onMouseEnter={handleProjectsMouseEnter}
                    onMouseLeave={handleProjectsMouseLeave}
                  >
                    <DropdownMenu open={isProjectsDropdownOpen} onOpenChange={setIsProjectsDropdownOpen}>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="text-sm font-medium text-secondary hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-md px-3 -mx-1 -my-4 py-4 h-full"
                          onClick={(e) => {
                            e.preventDefault()
                            handleNavClick(e as any, link.href)
                          }}
                        >
                          {link.label}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        onMouseEnter={handleProjectsMouseEnter}
                        onMouseLeave={handleProjectsMouseLeave}
                        className="mt-1 p-0 flex flex-col"
                        align="start"
                      >
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault()
                            handleNavClick(e as any, "#completed-projects")
                          }}
                          className="hover:!bg-gray-200 dark:hover:!bg-gray-800 focus:!bg-gray-200 dark:focus:!bg-gray-800 hover:!text-foreground focus:!text-foreground flex-1 flex items-center min-h-[2.5rem]"
                        >
                          Completed Projects
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault()
                            handleNavClick(e as any, "#current-projects")
                          }}
                          className="hover:!bg-gray-200 dark:hover:!bg-gray-800 focus:!bg-gray-200 dark:focus:!bg-gray-800 hover:!text-foreground focus:!text-foreground flex-1 flex items-center min-h-[2.5rem]"
                        >
                          Current Projects
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                )
              }
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="text-sm font-medium text-secondary hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-md px-3 -mx-1 -my-4 py-4 h-full block"
                  >
                    {link.label}
                  </a>
                </li>
              )
            })}
          </ul>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <ul className="flex flex-col gap-4 pt-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="block text-base font-medium text-secondary hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm px-2 py-1"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </header>
  )
}
