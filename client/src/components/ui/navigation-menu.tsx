import * as React from "react"
import { cva } from "class-variance-authority"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavigationMenuContextType {
  activeItem: string | null
  setActiveItem: (item: string | null) => void
}

const NavigationMenuContext = React.createContext<NavigationMenuContextType | null>(null)

interface NavigationMenuProps extends React.HTMLAttributes<HTMLElement> {}

const NavigationMenu = React.forwardRef<HTMLElement, NavigationMenuProps>(
  ({ className, children, ...props }, ref) => {
    const [activeItem, setActiveItem] = React.useState<string | null>(null)

    return (
      <NavigationMenuContext.Provider value={{ activeItem, setActiveItem }}>
        <nav
          ref={ref}
          className={cn(
            "relative z-10 flex max-w-max flex-1 items-center justify-center",
            className
          )}
          {...props}
        >
          {children}
        </nav>
      </NavigationMenuContext.Provider>
    )
  }
)
NavigationMenu.displayName = "NavigationMenu"

const NavigationMenuList = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn(
        "group flex flex-1 list-none items-center justify-center space-x-1",
        className
      )}
      {...props}
    />
  )
)
NavigationMenuList.displayName = "NavigationMenuList"

interface NavigationMenuItemProps extends React.HTMLAttributes<HTMLLIElement> {
  value?: string
}

const NavigationMenuItem = React.forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  ({ className, value, ...props }, ref) => (
    <li ref={ref} className={className} {...props} />
  )
)
NavigationMenuItem.displayName = "NavigationMenuItem"

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:text-accent-foreground data-[state=open]:bg-accent/50 data-[state=open]:hover:bg-accent data-[state=open]:focus:bg-accent"
)

interface NavigationMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string
}

const NavigationMenuTrigger = React.forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(
  ({ className, children, value, onClick, ...props }, ref) => {
    const context = React.useContext(NavigationMenuContext)
    const isActive = context?.activeItem === value

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (value) {
        context?.setActiveItem(isActive ? null : value)
      }
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        className={cn(navigationMenuTriggerStyle(), "group", className)}
        onClick={handleClick}
        data-state={isActive ? "open" : "closed"}
        {...props}
      >
        {children}{" "}
        <ChevronDown
          className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      </button>
    )
  }
)
NavigationMenuTrigger.displayName = "NavigationMenuTrigger"

interface NavigationMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
}

const NavigationMenuContent = React.forwardRef<HTMLDivElement, NavigationMenuContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = React.useContext(NavigationMenuContext)
    const isActive = context?.activeItem === value

    if (!isActive) return null

    return (
      <div
        ref={ref}
        className={cn(
          "absolute left-0 top-full w-full animate-in fade-in slide-in-from-top-2 md:w-auto",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
NavigationMenuContent.displayName = "NavigationMenuContent"

interface NavigationMenuLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  ({ className, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(navigationMenuTriggerStyle(), className)}
      {...props}
    />
  )
)
NavigationMenuLink.displayName = "NavigationMenuLink"

const NavigationMenuViewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn("absolute left-0 top-full flex justify-center")}>
      <div
        className={cn(
          "relative mt-1.5 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg animate-in fade-in zoom-in-90",
          className
        )}
        ref={ref}
        {...props}
      />
    </div>
  )
)
NavigationMenuViewport.displayName = "NavigationMenuViewport"

const NavigationMenuIndicator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden animate-in fade-in",
        className
      )}
      {...props}
    >
      <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
    </div>
  )
)
NavigationMenuIndicator.displayName = "NavigationMenuIndicator"

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
}