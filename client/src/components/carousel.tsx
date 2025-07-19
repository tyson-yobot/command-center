import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CarouselOptions = {
  axis?: "x" | "y"
  loop?: boolean
  align?: "start" | "center" | "end"
  skipSnaps?: boolean
  dragFree?: boolean
  containScroll?: "trimSnaps" | "keepSnaps" | false
}

type CarouselApi = {
  scrollPrev: () => void
  scrollNext: () => void
  scrollTo: (index: number) => void
  canScrollPrev: () => boolean
  canScrollNext: () => boolean
  selectedScrollSnap: () => number
  scrollSnapList: () => number[]
  on: (event: string, callback: (api: CarouselApi) => void) => void
  off: (event: string, callback: (api: CarouselApi) => void) => void
}

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: any[]
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: React.RefObject<HTMLDivElement | null>
  api: CarouselApi | null
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  currentIndex: number
  itemCount: number
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const carouselRef = React.useRef<HTMLDivElement>(null)
    const contentRef = React.useRef<HTMLDivElement>(null)
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [itemCount, setItemCount] = React.useState(0)
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)
    const eventListeners = React.useRef<Record<string, ((api: CarouselApi) => void)[]>>({})

    const scrollTo = React.useCallback((index: number) => {
      if (!contentRef.current) return

      const items = contentRef.current.children
      if (index < 0 || index >= items.length) return

      const item = items[index] as HTMLElement
      const container = carouselRef.current

      if (container && item) {
        const isHorizontal = orientation === "horizontal"
        const containerSize = isHorizontal ? container.clientWidth : container.clientHeight
        const itemSize = isHorizontal ? item.offsetWidth : item.offsetHeight
        const itemPosition = isHorizontal ? item.offsetLeft : item.offsetTop

        let scrollPosition = itemPosition
        
        // Center the item if possible
        if (opts?.align === "center") {
          scrollPosition = itemPosition - (containerSize - itemSize) / 2
        } else if (opts?.align === "end") {
          scrollPosition = itemPosition - (containerSize - itemSize)
        }

        container.scrollTo({
          [isHorizontal ? "left" : "top"]: scrollPosition,
          behavior: "smooth"
        })

        setCurrentIndex(index)
      }
    }, [orientation, opts?.align])

    const scrollPrev = React.useCallback(() => {
      const newIndex = opts?.loop && currentIndex === 0 
        ? itemCount - 1 
        : Math.max(0, currentIndex - 1)
      scrollTo(newIndex)
    }, [currentIndex, itemCount, opts?.loop, scrollTo])

    const scrollNext = React.useCallback(() => {
      const newIndex = opts?.loop && currentIndex === itemCount - 1 
        ? 0 
        : Math.min(itemCount - 1, currentIndex + 1)
      scrollTo(newIndex)
    }, [currentIndex, itemCount, opts?.loop, scrollTo])

    const updateScrollState = React.useCallback(() => {
      const canPrev = opts?.loop ? itemCount > 1 : currentIndex > 0
      const canNext = opts?.loop ? itemCount > 1 : currentIndex < itemCount - 1
      
      setCanScrollPrev(canPrev)
      setCanScrollNext(canNext)
    }, [currentIndex, itemCount, opts?.loop])

    const api: CarouselApi = React.useMemo(() => ({
      scrollPrev,
      scrollNext,
      scrollTo,
      canScrollPrev: () => canScrollPrev,
      canScrollNext: () => canScrollNext,
      selectedScrollSnap: () => currentIndex,
      scrollSnapList: () => Array.from({ length: itemCount }, (_, i) => i),
      on: (event: string, callback: (api: CarouselApi) => void) => {
        if (!eventListeners.current[event]) {
          eventListeners.current[event] = []
        }
        eventListeners.current[event].push(callback)
      },
      off: (event: string, callback: (api: CarouselApi) => void) => {
        if (eventListeners.current[event]) {
          eventListeners.current[event] = eventListeners.current[event].filter(cb => cb !== callback)
        }
      }
    }), [scrollPrev, scrollNext, scrollTo, canScrollPrev, canScrollNext, currentIndex, itemCount])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    // Update item count when children change
    React.useEffect(() => {
      if (contentRef.current) {
        const observer = new MutationObserver(() => {
          setItemCount(contentRef.current?.children.length || 0)
        })
        
        observer.observe(contentRef.current, { childList: true })
        setItemCount(contentRef.current.children.length)
        
        return () => observer.disconnect()
      }
    }, [children])

    // Update scroll state when dependencies change
    React.useEffect(() => {
      updateScrollState()
    }, [updateScrollState])

    // Set API reference
    React.useEffect(() => {
      if (setApi) {
        setApi(api)
      }
    }, [api, setApi])

    // Trigger events
    React.useEffect(() => {
      const callbacks = eventListeners.current["select"] || []
      callbacks.forEach(callback => callback(api))
    }, [currentIndex, api])

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api,
          opts,
          orientation,
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          currentIndex,
          itemCount
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {React.Children.map(children, child => {
            if (React.isValidElement(child) && child.type === CarouselContent) {
              return React.cloneElement(child as React.ReactElement<any>, { 
                ref: contentRef 
              })
            }
            return child
          })}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div 
      ref={carouselRef} 
      className={cn(
        "overflow-hidden",
        orientation === "horizontal" ? "overflow-x-auto" : "overflow-y-auto"
      )}
    >
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}