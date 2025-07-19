"use client"

import * as React from "react"

interface CollapsibleContextType {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CollapsibleContext = React.createContext<CollapsibleContextType | null>(null)

interface CollapsibleProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
  children: React.ReactNode
}

const Collapsible = ({ open, onOpenChange, defaultOpen = false, children }: CollapsibleProps) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  return (
    <CollapsibleContext.Provider value={{ open: isOpen, onOpenChange: setIsOpen }}>
      {children}
    </CollapsibleContext.Provider>
  )
}

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
  const context = React.useContext(CollapsibleContext)
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    context?.onOpenChange(!context.open)
    onClick?.(e)
  }

  return (
    <button ref={ref} onClick={handleClick} {...props}>
      {children}
    </button>
  )
})
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  const context = React.useContext(CollapsibleContext)
  
  if (!context?.open) return null

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  )
})
CollapsibleContent.displayName = "CollapsibleContent"

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
}