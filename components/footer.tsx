import React from 'react'

import { cn } from '@/lib/utils'
import { ExternalLink } from '@/components/external-link'

export function FooterText({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'px-2 text-center text-xs leading-normal text-muted-foreground',
        className
      )}
      {...props}
    >
      Built with the help of{' '}
      <ExternalLink href="https://github.com/vercel-labs/ai-chatbot">Vercel AI Chatbot</ExternalLink>
      <div>
        Not a helpful response? Tell us <a className="underline" href="https://tally.so#tally-open=w2ByJL&tally-emoji-text=🤖&tally-emoji-animation=wave">here</a>.
      </div>
    </p>
  )
}
