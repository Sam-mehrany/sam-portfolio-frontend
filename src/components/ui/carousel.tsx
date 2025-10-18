"use client"

import * as React from "react"
import { Splide, SplideSlide, SplideTrack } from '@splidejs/react-splide'
import '@splidejs/react-splide/css'
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Carousel wrapper component
type CarouselProps = {
  className?: string
  children?: React.ReactNode
  options?: {
    type?: 'loop' | 'slide' | 'fade'
    drag?: boolean | 'free'
    perPage?: number
    perMove?: number
    gap?: string | number
    padding?: string | number
    autoplay?: boolean
    interval?: number
    speed?: number
    rewind?: boolean
    arrows?: boolean
    pagination?: boolean
    breakpoints?: Record<number, any>
  }
}

function Carousel({
  className,
  children,
  options = {},
  ...props
}: CarouselProps & React.ComponentProps<"div">) {
  const defaultOptions = {
    type: 'slide' as const,
    drag: 'free' as const,
    perPage: 3,
    perMove: 1,
    gap: '1rem',
    padding: 0,
    arrows: true,
    pagination: false,
    rewind: false,
    speed: 600,
    breakpoints: {
      1024: { perPage: 2 },
      640: { perPage: 1 },
    },
  }

  const mergedOptions = { ...defaultOptions, ...options }

  return (
    <div className={cn("relative", className)} {...props}>
      <Splide
        options={mergedOptions}
        hasTrack={false}
        aria-label="Project media carousel"
      >
        <div className="relative">
          <SplideTrack>
            {children}
          </SplideTrack>

          {mergedOptions.arrows && (
            <>
              <div className="splide__arrows">
                <button className="splide__arrow splide__arrow--prev absolute left-4 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-accent transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Previous slide</span>
                </button>
                <button className="splide__arrow splide__arrow--next absolute right-4 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-accent transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                  <ArrowRight className="h-5 w-5" />
                  <span className="sr-only">Next slide</span>
                </button>
              </div>
            </>
          )}
        </div>
      </Splide>
    </div>
  )
}

// Carousel item/slide component
function CarouselItem({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <SplideSlide className={cn("", className)} {...props}>
      {children}
    </SplideSlide>
  )
}

// Legacy compatibility exports (keeping the same API)
function CarouselContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return <>{children}</>
}

function CarouselPrevious({ className, ...props }: React.ComponentProps<"button">) {
  // This is now handled internally by Splide
  return null
}

function CarouselNext({ className, ...props }: React.ComponentProps<"button">) {
  // This is now handled internally by Splide
  return null
}

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
