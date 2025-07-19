import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionContextType {
  type: "single" | "multiple"
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  collapsible?: boolean
}

const AccordionContext = React.createContext<AccordionContextType | null>(null)

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type: "single" | "multiple"
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  defaultValue?: string | string[]
  collapsible?: boolean
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, type, value, onValueChange, defaultValue, collapsible = false, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string | string[]>(
      defaultValue || (type === "multiple" ? [] : "")
    )
    
    const currentValue = value !== undefined ? value : internalValue

    const handleValueChange = React.useCallback((newValue: string | string[]) => {
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }, [value, onValueChange])

    return (
      <AccordionContext.Provider value={{ type, value: currentValue, onValueChange: handleValueChange, collapsible }}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    )
  }
)
Accordion.displayName = "Accordion"

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, ...props }, ref) => (
    <div
      ref={ref}
      data-value={value}
      className={cn("border-b", className)}
      {...props}
    />
  )
)
AccordionItem.displayName = "AccordionItem"

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, value, onClick, ...props }, ref) => {
    const context = React.useContext(AccordionContext)
    
    const isOpen = React.useMemo(() => {
      if (!context) return false
      if (context.type === "multiple") {
        return Array.isArray(context.value) && context.value.includes(value)
      }
      return context.value === value
    }, [context, value])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!context) return
      
      if (context.type === "multiple") {
        const currentArray = Array.isArray(context.value) ? context.value : []
        const newValue = currentArray.includes(value)
          ? currentArray.filter(v => v !== value)
          : [...currentArray, value]
        context.onValueChange?.(newValue)
      } else {
        const newValue = context.value === value && context.collapsible ? "" : value
        context.onValueChange?.(newValue)
      }
      
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </button>
    )
  }
)
AccordionTrigger.displayName = "AccordionTrigger"

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, value, ...props }, ref) => {
    const context = React.useContext(AccordionContext)
    
    const isOpen = React.useMemo(() => {
      if (!context) return false
      if (context.type === "multiple") {
        return Array.isArray(context.value) && context.value.includes(value)
      }
      return context.value === value
    }, [context, value])

    if (!isOpen) return null

    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
          className
        )}
        {...props}
      >
        <div className="pb-4 pt-0">{children}</div>
      </div>
    )
  }
)
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }