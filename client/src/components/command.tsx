import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/dialog"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface CommandContextType {
  search: string
  setSearch: (search: string) => void
  selectedIndex: number
  setSelectedIndex: (index: number) => void
  items: string[]
  setItems: React.Dispatch<React.SetStateAction<string[]>>
}

const CommandContext = React.createContext<CommandContextType | null>(null)

interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {}

const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  ({ className, children, ...props }, ref) => {
    const [search, setSearch] = React.useState("")
    const [selectedIndex, setSelectedIndex] = React.useState(0)
    const [items, setItems] = React.useState<string[]>([])

    const handleKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          // Dispatch selection event - handled by individual items
          break
      }
    }

    return (
      <CommandContext.Provider value={{ 
        search, 
        setSearch, 
        selectedIndex, 
        setSelectedIndex, 
        items, 
        setItems 
      }}>
        <div
          ref={ref}
          className={cn(
            "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
            className
          )}
          onKeyDown={handleKeyDown}
          {...props}
        >
          {children}
        </div>
      </CommandContext.Provider>
    )
  }
)
Command.displayName = "Command"

const CommandDialog = ({ children, ...props }: DialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[data-command-group-heading]]:px-2 [&_[data-command-group-heading]]:font-medium [&_[data-command-group-heading]]:text-muted-foreground [&_[data-command-group]:not([hidden])_~[data-command-group]]:pt-0 [&_[data-command-group]]:px-2 [&_[data-command-input-wrapper]_svg]:h-5 [&_[data-command-input-wrapper]_svg]:w-5 [&_[data-command-input]]:h-12 [&_[data-command-item]]:px-2 [&_[data-command-item]]:py-3 [&_[data-command-item]_svg]:h-5 [&_[data-command-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, ...props }, ref) => {
    const context = React.useContext(CommandContext)

    return (
      <div className="flex items-center border-b px-3" data-command-input-wrapper="">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          value={context?.search || ""}
          onChange={(e) => context?.setSearch(e.target.value)}
          data-command-input=""
          {...props}
        />
      </div>
    )
  }
)
CommandInput.displayName = "CommandInput"

interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {}

const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
        data-command-list=""
        {...props}
      >
        {children}
      </div>
    )
  }
)
CommandList.displayName = "CommandList"

interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> {}

const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ children = "No results found.", ...props }, ref) => {
    const context = React.useContext(CommandContext)
    
    if (!context?.search || context.items.length > 0) return null

    return (
      <div
        ref={ref}
        className="py-6 text-center text-sm"
        data-command-empty=""
        {...props}
      >
        {children}
      </div>
    )
  }
)
CommandEmpty.displayName = "CommandEmpty"

interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: string
}

const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ className, heading, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden p-1 text-foreground [&_[data-command-group-heading]]:px-2 [&_[data-command-group-heading]]:py-1.5 [&_[data-command-group-heading]]:text-xs [&_[data-command-group-heading]]:font-medium [&_[data-command-group-heading]]:text-muted-foreground",
          className
        )}
        data-command-group=""
        {...props}
      >
        {heading && (
          <div data-command-group-heading="" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            {heading}
          </div>
        )}
        {children}
      </div>
    )
  }
)
CommandGroup.displayName = "CommandGroup"

const CommandSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("-mx-1 h-px bg-border", className)}
      data-command-separator=""
      {...props}
    />
  )
)
CommandSeparator.displayName = "CommandSeparator"

interface CommandItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  disabled?: boolean
  onSelect?: (value: string) => void
  value?: string
}

const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
  ({ className, disabled, onSelect, value, children, onClick, ...props }, ref) => {
    const context = React.useContext(CommandContext)
    const [isVisible, setIsVisible] = React.useState(true)

    // Filter based on search
    React.useEffect(() => {
      if (!context?.search || !value) {
        setIsVisible(true)
        return
      }

      const searchLower = context.search.toLowerCase()
      const valueLower = value.toLowerCase()
      setIsVisible(valueLower.includes(searchLower))
    }, [context?.search, value])

    // Register item for keyboard navigation
    React.useEffect(() => {
      if (isVisible && value && context) {
        context.setItems((prev: string[]) => {
          if (!prev.includes(value)) {
            return [...prev, value]
          }
          return prev
        })
      } else if (!isVisible && value && context) {
        context.setItems((prev: string[]) => prev.filter((item: string) => item !== value))
      }

      return () => {
        if (value && context) {
          context.setItems((prev: string[]) => prev.filter((item: string) => item !== value))
        }
      }
    }, [isVisible, value, context])

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return
      
      if (onSelect && value) {
        onSelect(value)
      }
      onClick?.(e)
    }

    const itemIndex = context?.items.findIndex(item => item === value) ?? -1
    const isSelected = context?.selectedIndex === itemIndex

    if (!isVisible) return null

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
          disabled && "pointer-events-none opacity-50",
          isSelected && "bg-accent text-accent-foreground",
          !disabled && !isSelected && "hover:bg-accent hover:text-accent-foreground",
          "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          className
        )}
        onClick={handleClick}
        data-command-item=""
        data-disabled={disabled}
        data-selected={isSelected}
        {...props}
      >
        {children}
      </div>
    )
  }
)
CommandItem.displayName = "CommandItem"

const CommandShortcut = ({
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
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}