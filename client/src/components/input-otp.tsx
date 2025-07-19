import * as React from "react"
import { Dot } from "lucide-react"
import { cn } from "@/lib/utils"

interface OTPContextType {
  value: string
  onChange: (value: string) => void
  maxLength: number
  slots: Array<{
    char: string
    hasFakeCaret: boolean
    isActive: boolean
  }>
}

const OTPInputContext = React.createContext<OTPContextType | null>(null)

interface InputOTPProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  maxLength?: number
  value?: string
  onChange?: (value: string) => void
  containerClassName?: string
}

const InputOTP = React.forwardRef<HTMLInputElement, InputOTPProps>(
  ({ className, containerClassName, maxLength = 6, value = "", onChange, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value)
    const [activeIndex, setActiveIndex] = React.useState(0)
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useImperativeHandle(ref, () => inputRef.current!)

    const currentValue = value !== undefined ? value : internalValue
    const setValue = onChange || setInternalValue

    const slots = React.useMemo(() => {
      return Array.from({ length: maxLength }, (_, index) => ({
        char: currentValue[index] || "",
        hasFakeCaret: index === currentValue.length && index === activeIndex,
        isActive: index === activeIndex
      }))
    }, [currentValue, activeIndex, maxLength])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value.slice(0, maxLength)
      setValue(newValue)
      setActiveIndex(Math.min(newValue.length, maxLength - 1))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && currentValue.length > 0) {
        const newValue = currentValue.slice(0, -1)
        setValue(newValue)
        setActiveIndex(Math.max(0, newValue.length))
      }
    }

    const handleFocus = () => {
      setActiveIndex(currentValue.length)
    }

    const contextValue: OTPContextType = {
      value: currentValue,
      onChange: setValue,
      maxLength,
      slots
    }

    return (
      <OTPInputContext.Provider value={contextValue}>
        <div
          className={cn(
            "flex items-center gap-2 has-[:disabled]:opacity-50",
            containerClassName
          )}
        >
          <input
            ref={inputRef}
            type="text"
            value={currentValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            className={cn("sr-only", className)}
            maxLength={maxLength}
            {...props}
          />
          {children}
        </div>
      </OTPInputContext.Provider>
    )
  }
)
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
))
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  
  if (!inputOTPContext) {
    throw new Error("InputOTPSlot must be used within InputOTP")
  }

  const slot = inputOTPContext.slots[index]
  if (!slot) return null

  const { char, hasFakeCaret, isActive } = slot

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-2 ring-ring ring-offset-background",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Dot />
  </div>
))
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }