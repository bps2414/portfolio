import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "default" | "icon"
  asChild?: boolean
}

export function getButtonClasses(
  variant: "primary" | "secondary" | "outline" | "ghost" = "primary",
  sizeOrClassName: "default" | "icon" | string = "default",
  className?: string
) {
  const size = sizeOrClassName === "icon" || sizeOrClassName === "default" ? sizeOrClassName : "default"
  const resolvedClassName = sizeOrClassName === "icon" || sizeOrClassName === "default" ? className : sizeOrClassName
  const variants = {
    primary: "bg-accent text-accent-foreground hover:bg-accent/90 border border-transparent",
    secondary: "bg-transparent border border-border text-primary hover:bg-surface",
    outline: "border border-border bg-transparent hover:bg-surface text-primary",
    ghost: "hover:bg-surface hover:text-primary text-secondary",
  }
  const sizes = {
    default: "h-10 px-4 py-2",
    icon: "h-10 w-10 p-0",
  }
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    resolvedClassName
  )
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", asChild = false, children, ...props }, ref) => {
    if (asChild && React.isValidElement<{ className?: string }>(children)) {
      return React.cloneElement(children, {
        className: getButtonClasses(variant, size, cn(children.props.className, className)),
      })
    }

    return (
      <button
        ref={ref}
        className={getButtonClasses(variant, size, className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
