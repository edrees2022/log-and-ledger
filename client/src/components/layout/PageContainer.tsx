import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export default function PageContainer({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
  'mx-auto w-full max-w-screen-xl px-4 sm:px-6 md:px-8 min-w-0',
  // Use clamp to ensure we never exceed the viewport width
  'max-w-[100vw] box-border overflow-x-hidden',
        className
      )}
    >
      {children}
    </div>
  )
}
