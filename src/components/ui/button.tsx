import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "default" | "icon" | "lg" | "sm"
  asChild?: boolean
}

export function getButtonClasses(
  variant: "primary" | "secondary" | "outline" | "ghost" = "primary",
  sizeOrClassName: "default" | "icon" | "lg" | "sm" | string = "default",
  className?: string
) {
  const isSize = ["default", "icon", "lg", "sm"].includes(sizeOrClassName as string);
  const size = isSize ? sizeOrClassName : "default";
  const resolvedClassName = !isSize ? sizeOrClassName : className;

  const variants = {
    primary: "bg-accent hover:brightness-110 text-accent-foreground shadow-[0_0_15px_rgba(234,179,8,0.25)] md:hover:shadow-[0_0_25px_rgba(234,179,8,0.45)] border border-transparent md:hover:-translate-y-0.5 transition-all",
    secondary: "bg-surface border border-border text-primary hover:bg-raised shadow-sm md:hover:-translate-y-0.5 transition-all",
    outline: "border border-border bg-transparent hover:bg-raised hover:text-primary text-primary hover:border-accent/50 md:hover:-translate-y-0.5 transition-all",
    ghost: "hover:bg-raised hover:text-primary text-secondary md:hover:-translate-y-0.5 transition-all",
  }
  
  const sizes = {
    default: "h-11 px-5 py-2",
    sm: "h-9 px-4 text-xs",
    lg: "h-14 px-8 text-base",
    icon: "h-10 w-10 p-0",
  }

  return cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
    variants[variant as keyof typeof variants],
    sizes[size as keyof typeof sizes],
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
