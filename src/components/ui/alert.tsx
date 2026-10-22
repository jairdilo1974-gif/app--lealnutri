import * as React from "react"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success"
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "border-blue-200 bg-blue-50/70 text-blue-900 [&>svg]:text-blue-600",
      destructive: "border-red-200 bg-red-50/80 text-red-900 [&>svg]:text-red-600",
      success: "border-emerald-200 bg-emerald-50/80 text-emerald-900 [&>svg]:text-emerald-600",
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative flex items-start gap-3 rounded-xl border p-4 text-sm transition-all animate-in fade-in-50 duration-200",
          variants[variant],
          className
        )}
        {...props}
      >
        {variant === "destructive" && <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
        {variant === "success" && <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />}
        {variant === "default" && <Info className="h-5 w-5 shrink-0 mt-0.5" />}
        <div className="flex-1">{children}</div>
      </div>
    )
  }
)
Alert.displayName = "Alert"
