import { useCallback, useEffect, useMemo, useState } from 'react'
import Chat from '../chat'
import type {
  ChatConfig,
  ChatItem,
  OnSend,
} from '../types'
import { useChat } from '../chat/hooks'
import { getLastAnswer, isValidGeneratedAnswer } from '../utils'
import { useChatWithHistoryContext } from './context'
import { InputVarType } from '@/app/components/workflow/types'
import { TransferMethod } from '@/types/app'
import InputsForm from '@/app/components/base/chat/chat-with-history/inputs-form'
import {
  fetchSuggestedQuestions,
  getUrl,
  stopChatMessageResponding,
} from '@/service/share'
import AnswerIcon from '@/app/components/base/answer-icon'
import { Markdown } from '@/app/components/base/markdown'
import cn from '@/utils/classnames'
import type { FileEntity } from '../../file-uploader/types'
import { formatBooleanInputs } from '@/utils/model-config'
import Avatar from '../../avatar'
import avatarIconImage from '@/app/assets/icons/avatar.png'
import avatarPurchaseImage from '@/app/assets/icons/avatar-purchase.png'
import sayHiImage from '@/app/assets/images/say-hi.png'
import sayHiMessageImage from '@/app/assets/images/say-hi-message.png'
import sayHiPurchaseImage from '@/app/assets/images/say-hi-purchase.png'
import sayHiMessagePurchaseImage from '@/app/assets/images/say-hi-message-purchase.png'
import question1Icon from '@/app/assets/icons/question1.svg'
import question2Icon from '@/app/assets/icons/question2.svg'
import question3Icon from '@/app/assets/icons/question3.svg'
import question4Icon from '@/app/assets/icons/question4.svg'
import q1Icon from '@/app/assets/icons/q1.svg'
import q2Icon from '@/app/assets/icons/q2.svg'
import q3Icon from '@/app/assets/icons/q3.svg'
import tip1Icon from '@/app/assets/icons/tip1.svg'
import tip2Icon from '@/app/assets/icons/tip2.svg'
import tip3Icon from '@/app/assets/icons/tip3.svg'
import t1Icon from '@/app/assets/icons/t1.svg'
import t2Icon from '@/app/assets/icons/t2.svg'
import t3Icon from '@/app/assets/icons/t3.svg'
import Image from 'next/image'
import Button from '@/app/components/base/button'
import sendIconImage from '@/app/assets/icons/send.png'
const ChatWrapper = () => {
  const {
    appParams,
    appPrevChatTree,
    currentConversationId,
    currentConversationItem,
    currentConversationInputs,
    inputsForms,
    newConversationInputs,
    newConversationInputsRef,
    handleNewConversationCompleted,
    isMobile,
    isInstalledApp,
    appId,
    appMeta,
    handleFeedback,
    currentChatInstanceRef,
    appData,
    themeBuilder,
    sidebarCollapseState,
    clearChatList,
    setClearChatList,
    setIsResponding,
    allInputsHidden,
    initUserVariables,
  } = useChatWithHistoryContext()

  const appConfig = useMemo(() => {
    const config = appParams || {}

    return {
      ...config,
      file_upload: {
        ...(config as any).file_upload,
        fileUploadConfig: (config as any).system_parameters,
      },
      supportFeedback: true,
      opening_statement: currentConversationItem?.introduction || (config as any).opening_statement,
    } as ChatConfig
  }, [appParams, currentConversationItem?.introduction])
  const {
    chatList,
    setTargetMessageId,
    handleSend,
    handleStop,
    isResponding: respondingState,
    suggestedQuestions,
  } = useChat(
    appConfig,
    {
      inputs: (currentConversationId ? currentConversationInputs : newConversationInputs) as any,
      inputsForm: inputsForms,
    },
    appPrevChatTree,
    taskId => stopChatMessageResponding('', taskId, isInstalledApp, appId),
    clearChatList,
    setClearChatList,
  )
  const inputsFormValue = currentConversationId ? currentConversationInputs : newConversationInputsRef?.current
  const inputDisabled = useMemo(() => {
    if (allInputsHidden)
      return false

    let hasEmptyInput = ''
    let fileIsUploading = false
    const requiredVars = inputsForms.filter(({ required, type }) => required && type !== InputVarType.checkbox)
    if (requiredVars.length) {
      requiredVars.forEach(({ variable, label, type }) => {
        if (hasEmptyInput)
          return

        if (fileIsUploading)
          return

        if (!inputsFormValue?.[variable])
          hasEmptyInput = label as string

        if ((type === InputVarType.singleFile || type === InputVarType.multiFiles) && inputsFormValue?.[variable]) {
          const files = inputsFormValue[variable]
          if (Array.isArray(files))
            fileIsUploading = files.find(item => item.transferMethod === TransferMethod.local_file && !item.uploadedId)
          else
            fileIsUploading = files.transferMethod === TransferMethod.local_file && !files.uploadedId
        }
      })
    }
    if (hasEmptyInput)
      return true

    if (fileIsUploading)
      return true
    return false
  }, [inputsFormValue, inputsForms, allInputsHidden])

  useEffect(() => {
    if (currentChatInstanceRef.current)
      currentChatInstanceRef.current.handleStop = handleStop
  }, [])

  useEffect(() => {
    setIsResponding(respondingState)
  }, [respondingState, setIsResponding])

  const doSend: OnSend = useCallback((message, files, isRegenerate = false, parentAnswer: ChatItem | null = null) => {
    const data: any = {
      query: message,
      files,
      inputs: formatBooleanInputs(inputsForms, currentConversationId ? currentConversationInputs : newConversationInputs),
      conversation_id: currentConversationId,
      parent_message_id: (isRegenerate ? parentAnswer?.id : getLastAnswer(chatList)?.id) || null,
    }

    handleSend(
      getUrl('chat-messages', isInstalledApp, appId || ''),
      data,
      {
        onGetSuggestedQuestions: responseItemId => fetchSuggestedQuestions(responseItemId, isInstalledApp, appId),
        onConversationComplete: currentConversationId ? undefined : handleNewConversationCompleted,
        isPublicAPI: !isInstalledApp,
      },
    )
  }, [chatList, handleNewConversationCompleted, handleSend, currentConversationId, currentConversationInputs, newConversationInputs, isInstalledApp, appId])

  const doRegenerate = useCallback((chatItem: ChatItem, editedQuestion?: { message: string, files?: FileEntity[] }) => {
    const question = editedQuestion ? chatItem : chatList.find(item => item.id === chatItem.parentMessageId)!
    const parentAnswer = chatList.find(item => item.id === question.parentMessageId)
    doSend(editedQuestion ? editedQuestion.message : question.content,
      editedQuestion ? editedQuestion.files : question.message_files,
      true,
      isValidGeneratedAnswer(parentAnswer) ? parentAnswer : null,
    )
  }, [chatList, doSend])

  const messageList = useMemo(() => {
    if (currentConversationId || chatList.length > 1)
      return chatList
    // Without messages we are in the welcome screen, so hide the opening statement from chatlist
    return chatList.filter(item => !item.isOpeningStatement)
  }, [chatList])

  const [collapsed, setCollapsed] = useState(!!currentConversationId)

  const chatNode = useMemo(() => {
    if (allInputsHidden || !inputsForms.length)
      return null
    if (isMobile) {
      if (!currentConversationId)
        return <InputsForm collapsed={collapsed} setCollapsed={setCollapsed} />
      return null
    }
    else {
      return <InputsForm collapsed={collapsed} setCollapsed={setCollapsed} />
    }
  },
  [
    inputsForms.length,
    isMobile,
    currentConversationId,
    collapsed, allInputsHidden,
  ])

  // 判断是否显示欢迎界面（用于控制底部输入框的显示）
  const showWelcome = useMemo(() => {
    const welcomeMessage = chatList.find(item => item.isOpeningStatement)
    if (respondingState)
      return false
    if (currentConversationId)
      return false
    if (!welcomeMessage)
      return false
    if (!collapsed && inputsForms.length > 0 && !allInputsHidden)
      return false
    if (welcomeMessage.suggestedQuestions && welcomeMessage.suggestedQuestions?.length > 0)
      return true
    return false
  }, [chatList, collapsed, currentConversationId, inputsForms.length, respondingState, allInputsHidden])

  const welcome = useMemo(() => {
    if (!showWelcome)
      return null
    const welcomeMessage = chatList.find(item => item.isOpeningStatement)
    if (!welcomeMessage)
      return null
    if (welcomeMessage.suggestedQuestions && welcomeMessage.suggestedQuestions?.length > 0) {
      return (
        <div className='flex min-h-[50vh] flex-col items-center justify-center px-4 py-12'>
          {appId === '0e227844-dd40-465b-bb2c-3aee24e0bba3' ? (
            <>
              {/* 头像和欢迎消息区域 - 默认布局：消息在左，头像在右 */}
              <div className='relative mb-[-80px] flex w-full max-w-[900px] items-center justify-end gap-6'>
                {/* 欢迎消息气泡 */}
                {!isMobile && <div className='mb-[80px] mr-[-80px] flex flex-col items-end'>
                  <img
                    src={sayHiMessageImage.src}
                    alt="Welcome Message"
                    className="max-w-[296px]"
                  />
                </div>}
                {/* 机器人头像 */}
                <img
                  src={sayHiImage.src}
                  alt="Avatar"
                  className="h-[363px] shrink-0"
                />
              </div>
            </>
          ) : (
            <>
              {/* 头像和欢迎消息区域 - Purchase布局：头像在左，消息在右 */}
              <div className='relative mb-[-80px] flex w-full max-w-[900px] items-center justify-start gap-6'>
                {/* 机器人头像 */}
                <img
                  src={sayHiPurchaseImage.src}
                  alt="Avatar"
                  className="h-[363px] shrink-0"
                />
                {/* 欢迎消息气泡 */}
                {!isMobile && <div className='mb-[80px] ml-[-80px] flex flex-col items-start'>
                  <img
                    src={sayHiMessagePurchaseImage.src}
                    alt="Welcome Message"
                    className="max-w-[416px]"
                  />
                </div>}
              </div>
            </>
          )}

          {/* 输入框 */}
          <div className='relative z-10 mb-4 w-full max-w-[780px] px-4'>
            <div
              className='relative flex w-full flex-col rounded-[20px] bg-white p-4 pb-2'
              style={{
                minHeight: '220px',
                boxShadow: '0px 1.76px 3.52px 0px rgba(0, 0, 0, 0.1), 0px 0.88px 0.88px -0.44px rgba(0, 0, 0, 0.08), 0px 0px 0.44px 0.44px rgba(0, 0, 0, 0.2)',
              }}
            >
              <textarea
                id="welcome-input"
                placeholder={welcomeMessage.content}
                className='mb-3 flex-1 resize-none border-0 bg-transparent text-base text-gray-700 outline-none placeholder:text-gray-400'
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    const value = e.currentTarget.value.trim()
                    if (value) {
                      doSend(value, [])
                      e.currentTarget.value = ''
                    }
                  }
                }}
              />
              <div className='flex items-center justify-between'>
                {/* 左侧快捷按钮 */}
                <div className='flex items-center gap-2'>
                  {(appId === '0e227844-dd40-465b-bb2c-3aee24e0bba3' ? [
                    { icon: tip1Icon, text: '差旅费用' },
                    { icon: tip2Icon, text: '学术拜访' },
                    { icon: tip3Icon, text: '培训会议' },
                  ] : [
                    { icon: t1Icon, text: 'Coupa使用问题' },
                    { icon: t2Icon, text: '采购首选供应商' },
                    { icon: t3Icon, text: '品类咨询' },
                  ]).map((item, index) => (
                    <button
                      key={index}
                      className='system-xs-medium inline-flex items-center gap-1.5 rounded-full border-[0.5px] border-gray-300 bg-components-button-secondary-bg px-3 py-1.5 text-gray-600 shadow-xs transition-all hover:border-components-button-secondary-border-hover hover:bg-components-button-secondary-bg-hover'
                      onClick={() => {
                        const textarea = document.getElementById('welcome-input') as HTMLTextAreaElement
                        if (textarea) {
                          textarea.value = item.text
                          textarea.focus()
                        }
                      }}
                    >
                      <img
                        src={item.icon.src}
                        alt=""
                        className="h-3.5 w-3.5 shrink-0"
                      />
                      <span>{item.text}</span>
                    </button>
                  ))}
                </div>

                {/* 右侧发送按钮 */}
                <Button
                  variant='primary'
                  onClick={() => {
                    const textarea = document.getElementById('welcome-input') as HTMLTextAreaElement
                    const value = textarea?.value.trim()
                    if (value) {
                      doSend(value, [])
                      textarea.value = ''
                    }
                  }}
                  style={{
                    width: '80px',
                    height: '40px',
                    borderRadius: '40px',
                    background: 'linear-gradient(252.56deg, #001965 0.09%, #446CFA 99.91%)',
                    border: 'none',
                    padding: 0,
                  }}
                >
                  <Image
                    src={sendIconImage.src}
                    alt="Send"
                    width={20}
                    height={20}
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* 建议问题 */}
          <div className='flex w-full max-w-[768px] flex-wrap justify-center gap-3 px-4'>
            {welcomeMessage.suggestedQuestions.filter(q => !!q && q.trim()).map((question, index) => {
              const questionIcons = appId === '0e227844-dd40-465b-bb2c-3aee24e0bba3'
                ? [question1Icon, question2Icon, question3Icon, question4Icon]
                : [q1Icon, q2Icon, q3Icon]
              const icon = questionIcons[index]

              return (
                <div
                  key={index}
                  className='system-sm-medium inline-flex max-w-full shrink-0 cursor-pointer items-center gap-2 rounded-full border-[0.5px] border-components-button-secondary-border bg-components-button-secondary-bg px-3.5 py-2 text-[#333333] shadow-xs hover:border-components-button-secondary-border-hover hover:bg-components-button-secondary-bg-hover'
                  onClick={() => doSend(question, [])}
                >
                  {icon && (
                    <img
                      src={icon.src}
                      alt=""
                      className="h-4 w-4 shrink-0"
                    />
                  )}
                  <span>{question}</span>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
    return (
      <div className={cn('flex h-[50vh] flex-col items-center justify-center gap-3 py-12')}>
        <img
          src={appId === '0e227844-dd40-465b-bb2c-3aee24e0bba3' ? avatarIconImage.src : avatarPurchaseImage.src}
          alt="Avatar"
          className="h-[64px] w-[64px] rounded-full border border-[#E9EBF2] bg-white"
        />
        <div className='max-w-[768px] px-4'>
          <Markdown className='!body-2xl-regular !text-text-tertiary' content={welcomeMessage.content} />
        </div>
      </div>
    )
  },
  [
    appData?.site.icon,
    appData?.site.icon_background,
    appData?.site.icon_type,
    appData?.site.icon_url,
    chatList, collapsed,
    currentConversationId,
    inputsForms.length,
    respondingState,
    allInputsHidden,
  ])

  const answerIcon = (appData?.site && appData.site.use_icon_as_answer_icon)
    ? <AnswerIcon
      iconType={appData.site.icon_type}
      icon={appData.site.icon}
      background={appData.site.icon_background}
      imageUrl={appData.site.icon_url}
    />
    : null

  return (
    <div
      className='h-full overflow-hidden'
    >
      <Chat
        appData={appData ?? undefined}
        appId={appId}
        config={appConfig}
        chatList={messageList}
        isResponding={respondingState}
        chatContainerInnerClassName={`mx-auto pt-6 w-full max-w-[768px] ${isMobile && 'px-4'}`}
        chatFooterClassName='pb-4'
        chatFooterInnerClassName={`mx-auto w-full max-w-[768px] ${isMobile ? 'px-2' : 'px-4'}`}
        onSend={doSend}
        inputs={currentConversationId ? currentConversationInputs as any : newConversationInputs}
        inputsForm={inputsForms}
        onRegenerate={doRegenerate}
        onStopResponding={handleStop}
        noChatInput={showWelcome}
        chatNode={
          <>
            {chatNode}
            {welcome}
          </>
        }
        allToolIcons={appMeta?.tool_icons || {}}
        onFeedback={handleFeedback}
        suggestedQuestions={suggestedQuestions}
        answerIcon={answerIcon}
        hideProcessDetail
        themeBuilder={themeBuilder}
        switchSibling={siblingMessageId => setTargetMessageId(siblingMessageId)}
        inputDisabled={inputDisabled}
        isMobile={isMobile}
        sidebarCollapseState={sidebarCollapseState}
        questionIcon={
          initUserVariables?.avatar_url
            ? <Avatar
              avatar={initUserVariables.avatar_url}
              name={initUserVariables.name || 'user'}
              size={40}
            /> : undefined
        }
      />
    </div>
  )
}

export default ChatWrapper
