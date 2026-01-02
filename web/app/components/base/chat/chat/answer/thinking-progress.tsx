import type { FC } from 'react'
import { memo, useEffect, useState } from 'react'
import cn from '@/utils/classnames'

type ThinkingProgressProps = {
  content: string
  responding?: boolean
}

const ThinkingProgress: FC<ThinkingProgressProps> = ({ content, responding }) => {
  const [progress, setProgress] = useState(0)
  const [maxProgress, setMaxProgress] = useState(0)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    // 当开始响应时，立即激活进度条显示
    if (responding && !isActive) {
      setIsActive(true)
      setProgress(0)
      setMaxProgress(0)
    }
    // 当响应结束时，标记为非活跃
    else if (!responding && isActive && maxProgress >= 100) {
      setIsActive(false)
    }
  }, [responding, isActive, maxProgress])

  useEffect(() => {
    if (!isActive)
      return

    let newProgress = maxProgress // 默认保持当前进度

    // 如果正在响应中
    if (responding) {
      // 检测内容中的关键词来确定进度（按优先级从高到低检测）
      if (content.includes('已经在知识库中查询到相关内容')) {
        newProgress = 75
      }
      else if (content.includes('已经收到您的关于报销相关的问题')) {
        newProgress = 50
      }
      else if (!content || content.trim() === '') {
        // 如果还没有内容，显示 0% 进度条
        newProgress = 0
      }
      // else: 有内容但没有关键词，保持当前进度（已在初始化时设置）
    }
    else {
      // 如果回答已完成，则显示 100%
      newProgress = 100
    }

    // 允许进度增加或在响应开始时设置为 0
    if (newProgress > maxProgress || (newProgress === 0 && responding && maxProgress === 0)) {
      setMaxProgress(newProgress)
      setProgress(newProgress)
    }
  }, [content, responding, maxProgress, isActive])

  // 如果不活跃，不显示进度条
  if (!isActive)
    return null

  return (
    <div className="mb-3">
      <div className="mb-2 flex items-center gap-3">
        {/* 提示文字带 loading 图标 */}
        <div className="flex shrink-0 items-center gap-1.5">
          {/* Loading 旋转图标 */}
          <svg
            className="h-3.5 w-3.5 animate-spin text-text-tertiary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="system-xs-medium text-text-tertiary">
            正在检索，请稍后~
          </span>
        </div>
        {/* 进度条 */}
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              'bg-gradient-to-r from-[#001965] to-[#446CFA]',
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* 进度百分比 */}
        <span className="system-xs-medium shrink-0 text-text-tertiary">
          {progress}%
        </span>
      </div>
    </div>
  )
}

export default memo(ThinkingProgress)
