"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
})

interface ToggleGroupProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toggleVariants> {
  type?: "single" | "multiple"
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ className, variant, size, children, type = "single", value, onValueChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string | string[]>(
      type === "multiple" ? [] : ""
    )
    
    const currentValue = value ?? internalValue

    const handleToggle = React.useCallback((itemValue: string) => {
      if (type === "multiple") {
        const currentArray = Array.isArray(currentValue) ? currentValue : []
        const newValue = currentArray.includes(itemValue)
          ? currentArray.filter(v => v !== itemValue)
          : [...currentArray, itemValue]
        onValueChange?.(newValue)
        if (value === undefined) setInternalValue(newValue)
      } else {
        const newValue = currentValue === itemValue ? "" : itemValue
        onValueChange?.(newValue)
        if (value === undefined) setInternalValue(newValue)
      }
    }, [currentValue, type, onValueChange, value])

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center gap-1", className)}
        {...props}
      >
        <ToggleGroupContext.Provider value={{ variant, size }}>
          {React.Children.map(children, child => 
            React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<any>, {
                  onToggle: handleToggle,
                  pressed: type === "multiple" 
                    ? Array.isArray(currentValue) && currentValue.includes((child.props as any).value)
                    : currentValue === (child.props as any).value
                })
              : child
          )}
        </ToggleGroupContext.Provider>
      </div>
    )
  }
)

ToggleGroup.displayName = "ToggleGroup"

interface ToggleGroupItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onToggle'>, VariantProps<typeof toggleVariants> {
  value: string
  pressed?: boolean
  onToggle?: (value: string) => void
}

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ className, children, variant, size, value, pressed, onToggle, onClick, ...props }, ref) => {
    const context = React.useContext(ToggleGroupContext)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onToggle?.(value)
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        className={cn(
          toggleVariants({
            variant: context.variant || variant,
            size: context.size || size,
          }),
          pressed && "bg-accent text-accent-foreground",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)

ToggleGroupItem.displayName = "ToggleGroupItem"

export { ToggleGroup, ToggleGroupItem }