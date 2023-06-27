import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

const exampleMessages = [
  {
    heading: 'What is Viam?',
    message: 'Summarize Viam Robotics.'
  },
  {
    heading: 'Components vs Services',
    message: 'What is the difference between a Viam Component and a Viam Service?'
  },
  {
    heading: 'Choosing a Component',
    message: 'Which component should I use to detect my robots movement?'
  },
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-xl font-semibold">
          Welcome to Viam AI Chatbot
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          Ask me any questions about{' '}
          <a className='text-base font-semibold' href="https://www.viam.com">Viam Robotics</a>{' '}
          and I&apos;ll attempt to answer.
        </p>
        <p className="leading-normal text-muted-foreground">
          You can start a conversation below or try the following examples:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
        <p className="mb-2 mt-4 leading-normal text-muted-foreground">
          Download the{' '}
          <a className='text-base font-semibold' href="https://marketplace.visualstudio.com/items?itemName=waseemhnyc.viam-robotics-vsc-code-snippets">Viam Code Extension Tool</a>{' '}
          to help you get started.
        </p>
      </div>
    </div>
  )
}
