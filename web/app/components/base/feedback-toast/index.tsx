import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import smileIcon from '@/app/assets/icons/smile.png'
import angryIcon from '@/app/assets/icons/angry.png'

type FeedbackToastProps = {
  type: 'like' | 'dislike'
  onClose: () => void
}

const FeedbackToast: FC<FeedbackToastProps> = ({ type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    // 查找聊天容器 - 使用更可靠的选择器
    const chatContainer = document.querySelector('.chat-answer-container')?.closest('.relative.h-full')
    if (chatContainer) {
      setContainer(chatContainer as HTMLElement)
    }
    else {
      // 如果找不到聊天容器，使用 body
      setContainer(document.body)
    }
  }, [])

  useEffect(() => {
    // 延迟显示以触发动画
    setTimeout(() => setIsVisible(true), 10)

    // 3秒后自动关闭
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // 等待动画完成后再调用 onClose
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  const icon = type === 'like' ? smileIcon : angryIcon
  const text = type === 'like' ? '问题已解决' : '问题未解决'

  const toast = (
    <div
      className="pointer-events-none absolute inset-0 z-50 flex items-end justify-center"
      style={{
        paddingBottom: '100px', // 离底部的距离
      }}
    >
      <div
        className="transition-all duration-300"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: `translateY(${isVisible ? '0' : '20px'})`,
        }}
      >
        <div
          className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg"
          style={{
            width: '180px',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
          }}
        >
          <Image
            src={icon.src}
            alt={text}
            width={32}
            height={32}
            className="h-8 w-8 shrink-0"
          />
          <span
            className="flex-1 text-center text-base font-semibold"
            style={{ color: '#001965' }}
          >
            {text}
          </span>
        </div>
      </div>
    </div>
  )

  return container ? createPortal(toast, container) : null
}

export default FeedbackToast
