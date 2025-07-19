import * as React from "react"
import { Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  name?: string
  disabled?: boolean
}

const RadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  name?: string
  disabled?: boolean
}>({})

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, defaultValue, name, disabled, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "")
    const currentValue = value !== undefined ? value : internalValue

    const handleValueChange = React.useCallback((newValue: string) => {
      if (disabled) return
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }, [value, onValueChange, disabled])

    return (
      <RadioGroupContext.Provider value={{ 
        value: currentValue, 
        onValueChange: handleValueChange, 
        name: name || "radio-group",
        disabled 
      }}>
        <div
          ref={ref}
          role="radiogroup"
          className={cn("grid gap-2", className)}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

interface RadioGroupItemProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, disabled, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext)
    const isChecked = context.value === value
    const isDisabled = disabled || context.disabled

    const handleChange = () => {
      if (!isDisabled) {
        context.onValueChange?.(value)
      }
    }

    return (
      <div className="relative">
        <input
          ref={ref}
          type="radio"
          value={value}
          checked={isChecked}
          onChange={handleChange}
          disabled={isDisabled}
          name={context.name}
          className="sr-only"
          {...props}
        />
        <div
          onClick={handleChange}
          className={cn(
            "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
            isDisabled && "cursor-not-allowed opacity-50",
            className
          )}
        >
          {isChecked && (
            <div className="flex items-center justify-center h-full w-full">
              <Circle className="h-2.5 w-2.5 fill-current text-current" />
            </div>
          )}
        </div>
      </div>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }