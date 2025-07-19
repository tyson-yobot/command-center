"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Check, ChevronRight, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface MenubarContextType {
  activeMenu: string | null
  setActiveMenu: (menu: string | null) => void
}

const MenubarContext = React.createContext<MenubarContextType | null>(null)

interface MenuContextType {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MenuContext = React.createContext<MenuContextType | null>(null)

interface SubMenuContextType {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SubMenuContext = React.createContext<SubMenuContextType | null>(null)

interface MenubarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Menubar = React.forwardRef<HTMLDivElement, MenubarProps>(
  ({ className, children, ...props }, ref) => {
    const [activeMenu, setActiveMenu] = React.useState<string | null>(null)

    return (
      <MenubarContext.Provider value={{ activeMenu, setActiveMenu }}>
        <div
          ref={ref}
          className={cn(
            "flex h-10 items-center space-x-1 rounded-md border bg-background p-1",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </MenubarContext.Provider>
    )
  }
)
Menubar.displayName = "Menubar"

interface MenubarMenuProps {
  value?: string
  children: React.ReactNode
}

function MenubarMenu({ value, children }: MenubarMenuProps) {
  const menubarContext = React.useContext(MenubarContext)
  const [internalOpen, setInternalOpen] = React.useState(false)
  
  const isOpen = value ? menubarContext?.activeMenu === value : internalOpen
  const setIsOpen = (open: boolean) => {
    if (value) {
      menubarContext?.setActiveMenu(open ? value : null)
    } else {
      setInternalOpen(open)
    }
  }

  return (
    <MenuContext.Provider value={{ open: isOpen, onOpenChange: setIsOpen }}>
      {children}
    </MenuContext.Provider>
  )
}

interface MenubarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const MenubarTrigger = React.forwardRef<HTMLButtonElement, MenubarTriggerProps>(
  ({ className, children, onClick, ...props }, ref) => {
    const context = React.useContext(MenuContext)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      context?.onOpenChange(!context.open)
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        className={cn(
          "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
          className
        )}
        onClick={handleClick}
        data-state={context?.open ? "open" : "closed"}
        {...props}
      >
        {children}
      </button>
    )
  }
)
MenubarTrigger.displayName = "MenubarTrigger"

interface MenubarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end"
  alignOffset?: number
  sideOffset?: number
}

const MenubarContent = React.forwardRef<HTMLDivElement, MenubarContentProps>(
  ({ className, children, align = "start", alignOffset = -4, sideOffset = 8, ...props }, ref) => {
    const context = React.useContext(MenuContext)
    
    if (!context?.open) return null

    const handleContentClick = (e: React.MouseEvent) => {
      e.stopPropagation()
    }

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref && 'current' in ref && ref.current && !ref.current.contains(event.target as Node)) {
          context.onOpenChange(false)
        }
      }

      if (context.open) {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [context, ref])

    return createPortal(
      <div
        ref={ref}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
          className
        )}
        onClick={handleContentClick}
        {...props}
      >
        {children}
      </div>,
      document.body
    )
  }
)
MenubarContent.displayName = "MenubarContent"

interface MenubarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
  disabled?: boolean
}

const MenubarItem = React.forwardRef<HTMLDivElement, MenubarItemProps>(
  ({ className, inset, disabled, children, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return
      onClick?.(e)
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground",
          inset && "pl-8",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={handleClick}
        data-disabled={disabled}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MenubarItem.displayName = "MenubarItem"

interface MenubarCheckboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const MenubarCheckboxItem = React.forwardRef<HTMLDivElement, MenubarCheckboxItemProps>(
  ({ className, children, checked, onCheckedChange, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onCheckedChange?.(!checked)
      onClick?.(e)
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground",
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
MenubarCheckboxItem.displayName = "MenubarCheckboxItem"

interface MenubarRadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
}

function MenubarRadioGroup({ value, onValueChange, children, ...props }: MenubarRadioGroupProps) {
  return (
    <div {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement<MenubarRadioItemProps>(child)) {
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

interface MenubarRadioItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  checked?: boolean
  onCheckedChange?: () => void
}

const MenubarRadioItem = React.forwardRef<HTMLDivElement, MenubarRadioItemProps>(
  ({ className, children, checked, onCheckedChange, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onCheckedChange?.()
      onClick?.(e)
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground",
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
MenubarRadioItem.displayName = "MenubarRadioItem"

interface MenubarLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
}

const MenubarLabel = React.forwardRef<HTMLDivElement, MenubarLabelProps>(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-2 py-1.5 text-sm font-semibold",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
)
MenubarLabel.displayName = "MenubarLabel"

const MenubarSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  )
)
MenubarSeparator.displayName = "MenubarSeparator"

interface MenubarSubProps {
  children: React.ReactNode
}

function MenubarSub({ children }: MenubarSubProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <SubMenuContext.Provider value={{ open, onOpenChange: setOpen }}>
      {children}
    </SubMenuContext.Provider>
  )
}

interface MenubarSubTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
}

const MenubarSubTrigger = React.forwardRef<HTMLDivElement, MenubarSubTriggerProps>(
  ({ className, inset, children, ...props }, ref) => {
    const context = React.useContext(SubMenuContext)

    return (
      <div
        ref={ref}
        className={cn(
          "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground",
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
MenubarSubTrigger.displayName = "MenubarSubTrigger"

const MenubarSubContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(SubMenuContext)
    
    if (!context?.open) return null

    return createPortal(
      <div
        ref={ref}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground animate-in fade-in-0 zoom-in-95 slide-in-from-left-2",
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
MenubarSubContent.displayName = "MenubarSubContent"

function MenubarGroup({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>
}

function MenubarPortal({ children }: { children: React.ReactNode }) {
  return createPortal(children, document.body)
}

const MenubarShortcut = ({
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
MenubarShortcut.displayName = "MenubarShortcut"

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
}