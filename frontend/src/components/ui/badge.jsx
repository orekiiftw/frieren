import * as React from "react"
import { cn } from "../../lib/utils"

const Badge = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "border-transparent bg-white/10 text-zinc-100 hover:bg-white/15",
      secondary: "border-transparent bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
      outline: "text-zinc-400 border-white/[0.1]",
      premium: "border-transparent bg-white text-black",
      success: "border-transparent bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      warning: "border-transparent bg-amber-500/10 text-amber-400 border border-amber-500/20",
      danger: "border-transparent bg-red-500/10 text-red-400 border border-red-500/20",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white/20",
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
