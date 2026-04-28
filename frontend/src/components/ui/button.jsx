import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-white text-black hover:bg-zinc-200 active:scale-[0.98]",
      secondary: "bg-zinc-800/50 text-zinc-100 hover:bg-zinc-800 border border-white/[0.06]",
      outline: "border border-white/[0.1] bg-transparent hover:bg-white/[0.04] text-zinc-100",
      ghost: "hover:bg-white/[0.04] text-zinc-400 hover:text-zinc-100",
      destructive: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20",
      premium: "bg-gradient-to-r from-white via-zinc-200 to-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-[0.98]",
    }

    const sizes = {
      default: "h-10 px-5 py-2",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-8 text-base",
      icon: "h-10 w-10",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
