import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

/**
 * ResponsiveTabs - Tabs that wrap to multiple lines on mobile
 * Use this when you have many tabs that won't fit on a single line
 */
const ResponsiveTabs = TabsPrimitive.Root

const ResponsiveTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // Base styles
      "flex flex-wrap gap-1 rounded-lg bg-muted p-1.5 text-muted-foreground",
      // Mobile: allow wrapping, full width
      "w-full",
      // Desktop: inline layout
      "sm:inline-flex sm:w-auto",
      className
    )}
    {...props}
  />
))
ResponsiveTabsList.displayName = "ResponsiveTabsList"

const ResponsiveTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base styles
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium",
      "ring-offset-background transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      // Mobile: flexible width, can grow
      "flex-1 min-w-[80px]",
      // Desktop: auto width
      "sm:flex-none sm:min-w-0",
      className
    )}
    {...props}
  />
))
ResponsiveTabsTrigger.displayName = "ResponsiveTabsTrigger"

const ResponsiveTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
ResponsiveTabsContent.displayName = "ResponsiveTabsContent"

export { ResponsiveTabs, ResponsiveTabsList, ResponsiveTabsTrigger, ResponsiveTabsContent }
