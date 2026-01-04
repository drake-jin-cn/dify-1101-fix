import type { FC } from 'react'
import {
  memo,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  RiClipboardLine,
  RiResetLeftLine,
  RiThumbDownLine,
  RiThumbUpLine,
} from '@remixicon/react'
import type { ChatItem } from '../../types'
import { useChatContext } from '../context'
import copy from 'copy-to-clipboard'
import Toast from '@/app/components/base/toast'
import AnnotationCtrlButton from '@/app/components/base/features/new-feature-panel/annotation-reply/annotation-ctrl-button'
import EditReplyModal from '@/app/components/app/annotation/edit-annotation-modal'
import Log from '@/app/components/base/chat/chat/log'
import ActionButton, { ActionButtonState } from '@/app/components/base/action-button'
import NewAudioButton from '@/app/components/base/new-audio-button'
import Modal from '@/app/components/base/modal/modal'
import Textarea from '@/app/components/base/textarea'
import FeedbackToast from '@/app/components/base/feedback-toast'
import cn from '@/utils/classnames'

type OperationProps = {
  item: ChatItem
  question: string
  index: number
  showPromptLog?: boolean
  maxSize: number
  contentWidth: number
  hasWorkflowProcess: boolean
  noChatInput?: boolean
}

const Operation: FC<OperationProps> = ({
  item,
  question,
  index,
  showPromptLog,
  maxSize,
  contentWidth,
  hasWorkflowProcess,
  noChatInput,
}) => {
  const { t } = useTranslation()
  const {
    config,
    appId,
    onAnnotationAdded,
    onAnnotationEdited,
    onAnnotationRemoved,
    onFeedback,
    onRegenerate,
  } = useChatContext()
  const [isShowReplyModal, setIsShowReplyModal] = useState(false)
  const [isShowFeedbackModal, setIsShowFeedbackModal] = useState(false)
  const [feedbackContent, setFeedbackContent] = useState('')
  const [showFeedbackToast, setShowFeedbackToast] = useState<'like' | 'dislike' | null>(null)
  const {
    id,
    isOpeningStatement,
    content: messageContent,
    annotation,
    feedback,
    adminFeedback,
    agent_thoughts,
  } = item
  const [localFeedback, setLocalFeedback] = useState(config?.supportAnnotation ? adminFeedback : feedback)
  const [adminLocalFeedback, setAdminLocalFeedback] = useState(adminFeedback)

  // Separate feedback types for display
  const userFeedback = feedback

  const content = useMemo(() => {
    if (agent_thoughts?.length)
      return agent_thoughts.reduce((acc, cur) => acc + cur.thought, '')

    return messageContent
  }, [agent_thoughts, messageContent])

  const handleFeedback = async (rating: 'like' | 'dislike' | null, content?: string) => {
    if (!config?.supportFeedback || !onFeedback)
      return

    await onFeedback?.(id, { rating, content })
    setLocalFeedback({ rating })

    // Update admin feedback state separately if annotation is supported
    if (config?.supportAnnotation)
      setAdminLocalFeedback(rating ? { rating } : undefined)
    // 显示反馈气泡
    if (rating === 'like' || rating === 'dislike')
      setShowFeedbackToast(rating)
  }

  const handleThumbsDown = () => {
    setIsShowFeedbackModal(true)
  }

  const handleFeedbackSubmit = async () => {
    await handleFeedback('dislike', feedbackContent)
    setFeedbackContent('')
    setIsShowFeedbackModal(false)
  }

  const handleFeedbackCancel = () => {
    setFeedbackContent('')
    setIsShowFeedbackModal(false)
  }

  return (
    <>
      {/* 分隔虚线 */}
      {!isOpeningStatement && (
        <div
          className="my-2 h-[1px] w-full"
          style={{
            backgroundImage: 'repeating-linear-gradient(to right, #E9EBF2 0, #E9EBF2 8px, transparent 8px, transparent 14px)',
          }}
        />
      )}

      <div
        className={cn(
          'flex items-center justify-between gap-3',
        )}
      >
        {/* AI 提示文字 */}
        {!isOpeningStatement && (
          <span className="system-xs-regular flex-1 text-text-tertiary">
            {appId === '0e227844-dd40-465b-bb2c-3aee24e0bba3'
              ? '以上内容从财务报销常见问题库中通过AI理解生成，仅供参考！'
              : '以上内容从采购常见问题库中通过AI理解生成，仅供参考！'}
          </span>
        )}

        {/* 操作按钮区域 */}
        <div className="flex items-center gap-1">
          {showPromptLog && !isOpeningStatement && (
            <div className='block'>
              <Log logItem={item} />
            </div>
          )}
          {!isOpeningStatement && (
            <div className='ml-1 flex items-center gap-0.5 rounded-[10px] border-[0.5px] border-components-actionbar-border bg-components-actionbar-bg p-0.5 shadow-md backdrop-blur-sm'>
              {(config?.text_to_speech?.enabled) && (
                <NewAudioButton
                  id={id}
                  value={content}
                  voice={config?.text_to_speech?.voice}
                />
              )}
              <ActionButton onClick={() => {
                copy(content)
                Toast.notify({ type: 'success', message: t('common.actionMsg.copySuccessfully') })
              }}>
                <RiClipboardLine className='h-4 w-4' />
              </ActionButton>
              {!noChatInput && (
                <ActionButton onClick={() => onRegenerate?.(item)}>
                  <RiResetLeftLine className='h-4 w-4' />
                </ActionButton>
              )}
              {(config?.supportAnnotation && config.annotation_reply?.enabled) && (
                <AnnotationCtrlButton
                  appId={config?.appId || ''}
                  messageId={id}
                  cached={!!annotation?.id}
                  query={question}
                  answer={content}
                  onAdded={(id, authorName) => onAnnotationAdded?.(id, authorName, question, content, index)}
                  onEdit={() => setIsShowReplyModal(true)}
                />
              )}
            </div>
          )}
          {!isOpeningStatement && config?.supportFeedback && !localFeedback?.rating && onFeedback && (
            <div className='ml-1 flex items-center gap-0.5 rounded-[10px] border-[0.5px] border-components-actionbar-border bg-components-actionbar-bg p-0.5 shadow-md backdrop-blur-sm'>
              {!localFeedback?.rating && (
                <>
                  <ActionButton onClick={() => handleFeedback('like')}>
                    <RiThumbUpLine className='h-4 w-4' />
                  </ActionButton>
                  <ActionButton onClick={handleThumbsDown}>
                    <RiThumbDownLine className='h-4 w-4' />
                  </ActionButton>
                </>
              )}
            </div>
          )}
          {!isOpeningStatement && config?.supportFeedback && localFeedback?.rating && onFeedback && (
            <div className='ml-1 flex items-center gap-0.5 rounded-[10px] border-[0.5px] border-components-actionbar-border bg-components-actionbar-bg p-0.5 shadow-md backdrop-blur-sm'>
              {localFeedback?.rating === 'like' && (
                <ActionButton state={ActionButtonState.Active} onClick={() => handleFeedback(null)}>
                  <RiThumbUpLine className='h-4 w-4' />
                </ActionButton>
              )}
              {localFeedback?.rating === 'dislike' && (
                <ActionButton state={ActionButtonState.Destructive} onClick={() => handleFeedback(null)}>
                  <RiThumbDownLine className='h-4 w-4' />
                </ActionButton>
              )}
            </div>
          )}
        </div>
      </div>
      <EditReplyModal
        isShow={isShowReplyModal}
        onHide={() => setIsShowReplyModal(false)}
        query={question}
        answer={content}
        onEdited={(editedQuery, editedAnswer) => onAnnotationEdited?.(editedQuery, editedAnswer, index)}
        onAdded={(annotationId, authorName, editedQuery, editedAnswer) => onAnnotationAdded?.(annotationId, authorName, editedQuery, editedAnswer, index)}
        appId={config?.appId || ''}
        messageId={id}
        annotationId={annotation?.id || ''}
        createdAt={annotation?.created_at}
        onRemove={() => onAnnotationRemoved?.(index)}
      />
      {isShowFeedbackModal && (
        <Modal
          title={t('common.feedback.title') || 'Provide Feedback'}
          subTitle={t('common.feedback.subtitle') || 'Please tell us what went wrong with this response'}
          onClose={handleFeedbackCancel}
          onConfirm={handleFeedbackSubmit}
          onCancel={handleFeedbackCancel}
          confirmButtonText={t('common.operation.submit') || 'Submit'}
          cancelButtonText={t('common.operation.cancel') || 'Cancel'}
        >
          <div className='space-y-3'>
            <div>
              <label className='system-sm-semibold mb-2 block text-text-secondary'>
                {t('common.feedback.content') || 'Feedback Content'}
              </label>
              <Textarea
                value={feedbackContent}
                onChange={e => setFeedbackContent(e.target.value)}
                placeholder={t('common.feedback.placeholder') || 'Please describe what went wrong or how we can improve...'}
                rows={4}
                className='w-full'
              />
            </div>
          </div>
        </Modal>
      )}
      {showFeedbackToast && (
        <FeedbackToast
          type={showFeedbackToast}
          onClose={() => setShowFeedbackToast(null)}
        />
      )}
    </>
  )
}

export default memo(Operation)
