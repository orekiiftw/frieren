import * as React from "react"
import { cn } from "../../lib/utils"

const TooltipProvider = ({ children }) => children

const Tooltip = ({ children }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
    </div>
  )
}

const TooltipTrigger = React.forwardRef(
  ({ children, ...props }, ref) => (
    <div ref={ref} className="inline-flex" {...props}>
      {children}
    </div>
  )
)
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs text-zinc-100 bg-zinc-900 border border-white/[0.08] rounded-lg shadow-xl shadow-black/40 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none",
        className
      )}
      {...props}
    />
  )
)
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
