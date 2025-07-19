import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ 
    className, 
    value, 
    defaultValue = [0], 
    onValueChange, 
    min = 0, 
    max = 100, 
    step = 1,
    disabled = false,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const currentValue = value || internalValue
    const sliderRef = React.useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = React.useState(false)

    const updateValue = React.useCallback((clientX: number) => {
      if (!sliderRef.current || disabled) return

      const rect = sliderRef.current.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const rawValue = min + percentage * (max - min)
      const steppedValue = Math.round(rawValue / step) * step
      const clampedValue = Math.max(min, Math.min(max, steppedValue))
      
      const newValue = [clampedValue]
      
      if (!value) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }, [min, max, step, value, onValueChange, disabled])

    const handleMouseDown = (e: React.MouseEvent) => {
      if (disabled) return
      setIsDragging(true)
      updateValue(e.clientX)
    }

    React.useEffect(() => {
      if (!isDragging) return

      const handleMouseMove = (e: MouseEvent) => {
        updateValue(e.clientX)
      }

      const handleMouseUp = () => {
        setIsDragging(false)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }, [isDragging, updateValue])

    const percentage = ((currentValue[0] - min) / (max - min)) * 100

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        <div 
          ref={sliderRef}
          className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary cursor-pointer"
          onMouseDown={handleMouseDown}
        >
          <div 
            className="absolute h-full bg-primary transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div
          className={cn(
            "absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            !disabled && "cursor-grab active:cursor-grabbing",
            disabled && "pointer-events-none opacity-50"
          )}
          style={{ 
            left: `calc(${percentage}% - 10px)`,
            transform: 'translateY(-50%)',
            top: '50%'
          }}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }