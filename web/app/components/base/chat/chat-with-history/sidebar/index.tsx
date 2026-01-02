import {
  useCallback,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  RiAddLine,
  RiExpandRightLine,
} from '@remixicon/react'
import { useChatWithHistoryContext } from '../context'
import ActionButton from '@/app/components/base/action-button'
import Button from '@/app/components/base/button'
import List from '@/app/components/base/chat/chat-with-history/sidebar/list'
import MenuDropdown from '@/app/components/share/text-generation/menu-dropdown'
import Confirm from '@/app/components/base/confirm'
import RenameModal from '@/app/components/base/chat/chat-with-history/sidebar/rename-modal'
import type { ConversationItem } from '@/models/share'
import cn from '@/utils/classnames'
import novoLogoImage from '@/app/assets/logo/novo-logo.png'
import expandIconImage from '@/app/assets/icons/expand.png'
import avatarIconImage from '@/app/assets/icons/avatar.png'
import avatarPurchaseImage from '@/app/assets/icons/avatar-purchase.png'

type Props = {
  isPanel?: boolean
  panelVisible?: boolean
}

const Sidebar = ({ isPanel, panelVisible }: Props) => {
  const { t } = useTranslation()
  const {
    isInstalledApp,
    appData,
    appId,
    handleNewConversation,
    pinnedConversationList,
    conversationList,
    currentConversationId,
    handleChangeConversation,
    handlePinConversation,
    handleUnpinConversation,
    conversationRenaming,
    handleRenameConversation,
    handleDeleteConversation,
    sidebarCollapseState,
    handleSidebarCollapse,
    isMobile,
    isResponding,
  } = useChatWithHistoryContext()
  const isSidebarCollapsed = sidebarCollapseState
  const [showConfirm, setShowConfirm] = useState<ConversationItem | null>(null)
  const [showRename, setShowRename] = useState<ConversationItem | null>(null)

  const handleOperate = useCallback((type: string, item: ConversationItem) => {
    if (type === 'pin')
      handlePinConversation(item.id)

    if (type === 'unpin')
      handleUnpinConversation(item.id)

    if (type === 'delete')
      setShowConfirm(item)

    if (type === 'rename')
      setShowRename(item)
  }, [handlePinConversation, handleUnpinConversation])
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
    <div className={cn(
      'flex w-full grow flex-col rounded-xl border-[0.5px] border-components-panel-border-subtle shadow-lg [background:linear-gradient(180deg,#001965_63.59%,#00123D_100%)]',
    )}>
      <div className={cn(
        'flex shrink-0 items-center gap-3 p-3 pr-2',
      )}>
        <div className='shrink-0'>
          <img
            src={novoLogoImage.src}
            alt="Novo Logo"
            className="h-9 w-12 object-cover"
          />
        </div>
        <div className={cn('system-md-semibold grow truncate text-white')}>{appData?.site.title}</div>
        {!isMobile && isSidebarCollapsed && (
          <ActionButton size='l' onClick={() => handleSidebarCollapse(false)}>
            <RiExpandRightLine className='h-[18px] w-[18px]' />
          </ActionButton>
        )}
        {!isMobile && !isSidebarCollapsed && (
          <ActionButton size='l' onClick={() => handleSidebarCollapse(true)}>
            <img
              src={expandIconImage.src}
              alt="Expand"
              className="h-[18px] w-[18px]"
            />
          </ActionButton>
        )}
      </div>
      <div className='shrink-0 px-3 py-4'>
        <Button
          variant='secondary-accent'
          disabled={isResponding}
          className='w-full justify-center'
          onClick={handleNewConversation}
          style={{
            color: 'white',
            height: '48px',
            borderRadius: '60px',
            borderWidth: '1px',
            background: 'linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%)',
            border: '1px solid #FFFFFF80',
            backdropFilter: 'blur(4px)',
          }}
        >
          <RiAddLine className='mr-[4px] h-[18px] w-[18px]' />
          {t('share.chat.newChat')}
        </Button>
      </div>
      <div className='h-0 grow space-y-2 overflow-y-auto px-3 pt-4'>
        {/* pinned list */}
        {!!pinnedConversationList.length && (
          <div className='mb-4'>
            <List
              isPin
              title={t('share.chat.pinnedTitle') || ''}
              list={pinnedConversationList}
              onChangeConversation={handleChangeConversation}
              onOperate={handleOperate}
              currentConversationId={currentConversationId}
            />
          </div>
        )}
        {!!conversationList.length && (
          <List
            title={(pinnedConversationList.length && t('share.chat.unpinnedTitle')) || ''}
            list={conversationList}
            onChangeConversation={handleChangeConversation}
            onOperate={handleOperate}
            currentConversationId={currentConversationId}
          />
        )}
      </div>
      <div className='flex shrink-0 items-center justify-between p-3'>
        <img
          src={appId === 'a315e21d-08de-4cfb-85e7-238fb50683e3' ? avatarIconImage.src : avatarPurchaseImage.src}
          alt="Avatar"
          className="h-[48px] w-[48px] rounded-full border border-[#E9EBF2] bg-white"
        />
        <MenuDropdown
          hideLogout={isInstalledApp}
          placement='top-start'
          data={appData?.site}
          forceClose={isPanel && !panelVisible}
        />
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
      </div>
    </div>
  )
}

export default Sidebar
