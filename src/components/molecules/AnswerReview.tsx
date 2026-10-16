import { Text } from '@/components/atoms/Text'

interface AnswerReviewProps {
  items: { id: string; question: string; answer: string }[]
}

/** The check-your-answers list on the wizard's last step: every question with
 * the candidate-readable answer, read-only — Back is the way to edit (#36). */
export function AnswerReview({ items }: AnswerReviewProps) {
  return (
    <dl className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.id} className="flex flex-col gap-0.5 border-b border-muted/30 pb-3">
          <Text as="dt" tone="muted" size="sm">
            {item.question}
          </Text>
          {/* break-words: a long unbroken answer must wrap, never push the
              page into horizontal overflow. */}
          <Text as="dd" weight="medium" className="break-words">
            {item.answer}
          </Text>
        </div>
      ))}
    </dl>
  )
}
