import type { FC } from 'react'
import { memo } from 'react'
import type { ChatItem } from '../../types'
import { Markdown } from '@/app/components/base/markdown'
import cn from '@/utils/classnames'
import ThinkingProgress from './thinking-progress'

type BasicContentProps = {
  item: ChatItem
  responding?: boolean
}
const BasicContent: FC<BasicContentProps> = ({
  item,
  responding,
}) => {
  const {
    annotation,
    content,
  } = item

  if (annotation?.logAnnotation)
    return <Markdown content={annotation?.logAnnotation.content || ''} />

  return (
    <>
      <ThinkingProgress content={content} responding={responding} />
      <Markdown
        className={cn(
          item.isError && '!text-[#F04438]',
        )}
        content={content}
      />
    </>
  )
}

export default memo(BasicContent)
