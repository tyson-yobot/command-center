"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface HoverCardContextType {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const HoverCardContext = React.createContext<HoverCardContextType | null>(null)

interface HoverCardProps {
  openDelay?: number
  closeDelay?: number
  children: React.ReactNode
}

const HoverCard = ({ openDelay = 700, closeDelay = 300, children }: HoverCardProps) => {
  const [open, setOpen] = React.useState(false)
  const openTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined)
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined)

  const onOpenChange = React.useCallback((newOpen: boolean) => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }

    if (newOpen) {
      openTimeoutRef.current = setTimeout(() => setOpen(true), openDelay)
    } else {
      closeTimeoutRef.current = setTimeout(() => setOpen(false), closeDelay)
    }
  }, [openDelay, closeDelay])

  React.useEffect(() => {
    return () => {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current)
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  return (
    <HoverCardContext.Provider value={{ open, onOpenChange }}>
      {children}
    </HoverCardContext.Provider>
  )
}

interface HoverCardTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean
}

const HoverCardTrigger = React.forwardRef<HTMLElement, HoverCardTriggerProps>(
  ({ className, children, asChild, ...props }, ref) => {
    const context = React.useContext(HoverCardContext)
    
    if (!context) {
      throw new Error("HoverCardTrigger must be used within HoverCard")
    }

    const handleMouseEnter = () => {
      context.onOpenChange(true)
    }

    const handleMouseLeave = () => {
      context.onOpenChange(false)
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        ...props
      })
    }

    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </span>
    )
  }
)
HoverCardTrigger.displayName = "HoverCardTrigger"

interface HoverCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
}

const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
  ({ className, align = "center", sideOffset = 4, children, ...props }, ref) => {
    const context = React.useContext(HoverCardContext)
    
    if (!context) {
      throw new Error("HoverCardContent must be used within HoverCard")
    }

    if (!context.open) return null

    const handleMouseEnter = () => {
      context.onOpenChange(true)
    }

    const handleMouseLeave = () => {
      context.onOpenChange(false)
    }

    return createPortal(
      <div
        ref={ref}
        className={cn(
          "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2",
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>,
      document.body
    )
  }
)
HoverCardContent.displayName = "HoverCardContent"

export { HoverCard, HoverCardTrigger, HoverCardContent }