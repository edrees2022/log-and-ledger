import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * ResponsiveTable - A table wrapper that enables horizontal scrolling on mobile
 * Use this for tables that need to show all columns on mobile devices
 */
const ResponsiveTable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0",
      className
    )}
    {...props}
  >
    <div className="min-w-[640px] sm:min-w-0">
      {children}
    </div>
  </div>
))
ResponsiveTable.displayName = "ResponsiveTable"

/**
 * MobileCard - A card layout for displaying table data on mobile
 * Shows data in a stacked card format instead of table rows
 */
interface MobileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  badge?: React.ReactNode
  actions?: React.ReactNode
}

const MobileCard = React.forwardRef<HTMLDivElement, MobileCardProps>(
  ({ className, title, subtitle, badge, actions, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card p-4 shadow-sm space-y-3",
        className
      )}
      {...props}
    >
      {(title || badge || actions) && (
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="font-medium text-sm truncate">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {badge}
            {actions}
          </div>
        </div>
      )}
      {children}
    </div>
  )
)
MobileCard.displayName = "MobileCard"

/**
 * MobileCardField - A key-value pair display for mobile cards
 */
interface MobileCardFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value?: React.ReactNode
  icon?: React.ReactNode
}

const MobileCardField = React.forwardRef<HTMLDivElement, MobileCardFieldProps>(
  ({ className, label, value, icon, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-between gap-2 text-sm", className)}
      {...props}
    >
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-medium text-end truncate max-w-[60%]">{value || '-'}</span>
    </div>
  )
)
MobileCardField.displayName = "MobileCardField"

export { ResponsiveTable, MobileCard, MobileCardField }
