import { Text } from '@/components/atoms/Text'

interface AnswerReviewProps {
  items: { id: string; question: string; answer: string }[]
}

export function AnswerReview({ items }: AnswerReviewProps) {
  return (
    <dl className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.id} className="flex flex-col gap-0.5 border-b border-muted/30 pb-3">
          <Text as="dt" tone="muted" size="sm">
            {item.question}
          </Text>
          <Text as="dd" weight="medium" className="break-words">
            {item.answer}
          </Text>
        </div>
      ))}
    </dl>
  )
}
