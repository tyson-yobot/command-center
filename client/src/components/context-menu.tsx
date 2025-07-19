import * as React from "react"
import { createPortal } from "react-dom"
import { Check, ChevronRight, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContextMenuContextType {
  open: boolean
  onOpenChange: (open: boolean) => void
  position: { x: number; y: number }
}

const ContextMenuContext = React.createContext<ContextMenuContextType | null>(null)

interface SubMenuContextType {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SubMenuContext = React.createContext<SubMenuContextType | null>(null)

interface ContextMenuProps {
  children: React.ReactNode
}

const ContextMenu = ({ children }: ContextMenuProps) => {
  const [open, setOpen] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })

  const onOpenChange = React.useCallback((newOpen: boolean) => {
    setOpen(newOpen)
  }, [])

  const handleContextMenu = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setPosition({ x: e.clientX, y: e.clientY })
    setOpen(true)
  }, [])

  React.useEffect(() => {
    const handleClick = () => setOpen(false)
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    if (open) {
      document.addEventListener('click', handleClick)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('click', handleClick)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [open])

  return (
    <ContextMenuContext.Provider value={{ open, onOpenChange, position }}>
      <div onContextMenu={handleContextMenu}>
        {children}
      </div>
    </ContextMenuContext.Provider>
  )
}

interface ContextMenuTriggerProps extends React.HTMLAttributes<HTMLDivElement> {}

const ContextMenuTrigger = React.forwardRef<HTMLDivElement, ContextMenuTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
)
ContextMenuTrigger.displayName = "ContextMenuTrigger"

interface ContextMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const ContextMenuContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(ContextMenuContext)
    
    if (!context?.open) return null

    const handleContentClick = (e: React.MouseEvent) => {
      e.stopPropagation()
    }

    return createPortal(
      <div
        ref={ref}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 zoom-in-95",
          className
        )}
        style={{
          position: 'fixed',
          left: context.position.x,
          top: context.position.y
        }}
        onClick={handleContentClick}
        {...props}
      >
        {children}
      </div>,
      document.body
    )
  }
)
ContextMenuContent.displayName = "ContextMenuContent"

interface ContextMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
  disabled?: boolean
}

const ContextMenuItem = React.forwardRef<HTMLDivElement, ContextMenuItemProps>(
  ({ className, inset, disabled, children, onClick, ...props }, ref) => {
    const context = React.useContext(ContextMenuContext)

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return
      onClick?.(e)
      context?.onOpenChange(false)
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
          inset && "pl-8",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ContextMenuItem.displayName = "ContextMenuItem"

interface ContextMenuCheckboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const ContextMenuCheckboxItem = React.forwardRef<HTMLDivElement, ContextMenuCheckboxItemProps>(
  ({ className, children, checked, onCheckedChange, onClick, ...props }, ref) => {
    const context = React.useContext(ContextMenuContext)

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onCheckedChange?.(!checked)
      onClick?.(e)
      context?.onOpenChange(false)
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {checked && <Check className="h-4 w-4" />}
        </span>
        {children}
      </div>
    )
  }
)
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem"

interface ContextMenuRadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
}

const ContextMenuRadioGroup = ({ value, onValueChange, children, ...props }: ContextMenuRadioGroupProps) => {
  return (
    <div {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement<ContextMenuRadioItemProps>(child)) {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onCheckedChange: () => onValueChange?.(child.props.value || "")
          })
        }
        return child
      })}
    </div>
  )
}

interface ContextMenuRadioItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  checked?: boolean
  onCheckedChange?: () => void
}

const ContextMenuRadioItem = React.forwardRef<HTMLDivElement, ContextMenuRadioItemProps>(
  ({ className, children, checked, onCheckedChange, onClick, ...props }, ref) => {
    const context = React.useContext(ContextMenuContext)

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onCheckedChange?.()
      onClick?.(e)
      context?.onOpenChange(false)
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {checked && <Circle className="h-2 w-2 fill-current" />}
        </span>
        {children}
      </div>
    )
  }
)
ContextMenuRadioItem.displayName = "ContextMenuRadioItem"

interface ContextMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
}

const ContextMenuLabel = React.forwardRef<HTMLDivElement, ContextMenuLabelProps>(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-2 py-1.5 text-sm font-semibold text-foreground",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
)
ContextMenuLabel.displayName = "ContextMenuLabel"

const ContextMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
)
ContextMenuSeparator.displayName = "ContextMenuSeparator"

interface ContextMenuSubProps {
  children: React.ReactNode
}

const ContextMenuSub = ({ children }: ContextMenuSubProps) => {
  const [open, setOpen] = React.useState(false)

  return (
    <SubMenuContext.Provider value={{ open, onOpenChange: setOpen }}>
      {children}
    </SubMenuContext.Provider>
  )
}

interface ContextMenuSubTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
}

const ContextMenuSubTrigger = React.forwardRef<HTMLDivElement, ContextMenuSubTriggerProps>(
  ({ className, inset, children, ...props }, ref) => {
    const context = React.useContext(SubMenuContext)

    return (
      <div
        ref={ref}
        className={cn(
          "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
          inset && "pl-8",
          className
        )}
        onMouseEnter={() => context?.onOpenChange(true)}
        onMouseLeave={() => context?.onOpenChange(false)}
        {...props}
      >
        {children}
        <ChevronRight className="ml-auto h-4 w-4" />
      </div>
    )
  }
)
ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger"

const ContextMenuSubContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(SubMenuContext)
    
    if (!context?.open) return null

    return createPortal(
      <div
        ref={ref}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 slide-in-from-left-2",
          className
        )}
        onMouseEnter={() => context.onOpenChange(true)}
        onMouseLeave={() => context.onOpenChange(false)}
        {...props}
      >
        {children}
      </div>,
      document.body
    )
  }
)
ContextMenuSubContent.displayName = "ContextMenuSubContent"

const ContextMenuGroup = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div {...props}>{children}</div>
}

const ContextMenuPortal = ({ children }: { children: React.ReactNode }) => {
  return createPortal(children, document.body)
}

const ContextMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
ContextMenuShortcut.displayName = "ContextMenuShortcut"

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}