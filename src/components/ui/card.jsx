// src/components/ui/card.jsx
import { cn } from "@/lib/utils"

const Card = ({ className, ...props }) => (
  <div
    className={cn("rounded-lg border bg-white text-gray-900 shadow-sm", className)}
    {...props}
  />
)
Card.displayName = "Card"

const CardHeader = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
)
CardHeader.displayName = "CardHeader"

const CardContent = ({ className, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
)
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardContent }