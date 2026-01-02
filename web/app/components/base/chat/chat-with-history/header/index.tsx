import { useCallback, useState } from 'react'
import { RiAddLine, RiResetLeftLine } from '@remixicon/react'
import { useTranslation } from 'react-i18next'
import {
  useChatWithHistoryContext,
} from '../context'
import Operation from './operation'
import ActionButton, { ActionButtonState } from '@/app/components/base/action-button'
import Tooltip from '@/app/components/base/tooltip'
import ViewFormDropdown from '@/app/components/base/chat/chat-with-history/inputs-form/view-form-dropdown'
import Confirm from '@/app/components/base/confirm'
import RenameModal from '@/app/components/base/chat/chat-with-history/sidebar/rename-modal'
import type { ConversationItem } from '@/models/share'
import cn from '@/utils/classnames'
import collapseIconImage from '@/app/assets/icons/collapse.png'

const Header = () => {
  const {
    currentConversationId,
    currentConversationItem,
    inputsForms,
    pinnedConversationList,
    handlePinConversation,
    handleUnpinConversation,
    conversationRenaming,
    handleRenameConversation,
    handleDeleteConversation,
    handleNewConversation,
    sidebarCollapseState,
    handleSidebarCollapse,
    isResponding,
  } = useChatWithHistoryContext()
  const { t } = useTranslation()
  const isSidebarCollapsed = sidebarCollapseState

  const isPin = pinnedConversationList.some(item => item.id === currentConversationId)

  const [showConfirm, setShowConfirm] = useState<ConversationItem | null>(null)
  const [showRename, setShowRename] = useState<ConversationItem | null>(null)
  const handleOperate = useCallback((type: string) => {
    if (type === 'pin')
      handlePinConversation(currentConversationId)

    if (type === 'unpin')
      handleUnpinConversation(currentConversationId)

    if (type === 'delete')
      setShowConfirm(currentConversationItem as any)

    if (type === 'rename')
      setShowRename(currentConversationItem as any)
  }, [currentConversationId, currentConversationItem, handlePinConversation, handleUnpinConversation])
  const handleCancelConfirm = useCallback(() => {
    setShowConfirm(null)
  }, [])
  const handleDelete = useCallback(() => {
    if (showConfirm)
      handleDeleteConversation(showConfirm.id, { onSuccess: handleCancelConfirm })
  }, [showConfirm, handleDeleteConversation, handleCancelConfirm])
  const handleCancelRename = useCallback(() => {
    setShowRename(null)
  }, [])
  const handleRename = useCallback((newName: string) => {
    if (showRename)
      handleRenameConversation(showRename.id, newName, { onSuccess: handleCancelRename })
  }, [showRename, handleRenameConversation, handleCancelRename])

  return (
    <>
      <div className='flex h-14 shrink-0 items-center justify-between p-3'>
        <div className={cn('flex items-center gap-1 transition-all duration-200 ease-in-out', !isSidebarCollapsed && 'user-select-none opacity-0')}>
          <ActionButton className={cn(!isSidebarCollapsed && 'cursor-default')} size='l' onClick={() => handleSidebarCollapse(false)}>
            <img
              src={collapseIconImage.src}
              alt="Collapse"
              className="h-[18px] w-[18px]"
            />
          </ActionButton>
          {currentConversationId && currentConversationItem && isSidebarCollapsed && (
            <>
              <div className='p-1 text-divider-deep'>/</div>
              <Operation
                title={currentConversationItem?.name || ''}
                isPinned={!!isPin}
                togglePin={() => handleOperate(isPin ? 'unpin' : 'pin')}
                isShowDelete
                isShowRenameConversation
                onRenameConversation={() => handleOperate('rename')}
                onDelete={() => handleOperate('delete')}
              />
            </>
          )}
          <div className='flex items-center px-1'>
            <div className='mr-[6px] h-[14px] w-px bg-[#001965]'></div>
          </div>
          {isSidebarCollapsed && (
            <Tooltip
              disabled={!!currentConversationId}
              popupContent={t('share.chat.newChatTip')}
            >
              <div>
                <ActionButton
                  size='l'
                  state={(!currentConversationId || isResponding) ? ActionButtonState.Disabled : ActionButtonState.Default}
                  disabled={!currentConversationId || isResponding}
                  onClick={handleNewConversation}
                  style={{
                    height: '32px',
                    width: '120px',
                    border: '1px solid #446CFA80',
                    borderRadius: '30px',
                    paddingTop: '6px',
                    paddingRight: '12px',
                    paddingBottom: '6px',
                    paddingLeft: '12px',
                    color: '#446CFA',
                    fontSize: '12px',
                    background: 'linear-gradient(0deg, rgba(68, 108, 250, 0.1), rgba(68, 108, 250, 0.1)), linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%)',
                  }}
                >
                  <RiAddLine className='h-[14px] w-[14px]' />
                  {t('share.chat.newChat')}
                </ActionButton>
              </div>
            </Tooltip>
          )}
        </div>
        <div className='flex items-center gap-1'>
          {currentConversationId && (
            <Tooltip
              popupContent={t('share.chat.resetChat')}
            >
              <ActionButton size='l' onClick={handleNewConversation}>
                <RiResetLeftLine className='h-[18px] w-[18px]' />
              </ActionButton>
            </Tooltip>
          )}
          {currentConversationId && inputsForms.length > 0 && (
            <ViewFormDropdown />
          )}
        </div>
      </div>
      {!!showConfirm && (
        <Confirm
          title={t('share.chat.deleteConversation.title')}
          content={t('share.chat.deleteConversation.content') || ''}
          isShow
          onCancel={handleCancelConfirm}
          onConfirm={handleDelete}
        />
      )}
      {showRename && (
        <RenameModal
          isShow
          onClose={handleCancelRename}
          saveLoading={conversationRenaming}
          name={showRename?.name || ''}
          onSave={handleRename}
        />
      )}
    </>
  )
}

export default Header
