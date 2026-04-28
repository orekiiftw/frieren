import * as React from "react"
import { cn } from "../../lib/utils"

const ScrollArea = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <div className="h-full w-full overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800/50">
        {children}
      </div>
    </div>
  )
)
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
