import type { FC, Ref } from 'react'
import { memo } from 'react'
import {
  RiMicLine,
} from '@remixicon/react'
import Image from 'next/image'
import type {
  EnableType,
} from '../../types'
import type { Theme } from '../../embedded-chatbot/theme/theme-context'
import Button from '@/app/components/base/button'
import ActionButton from '@/app/components/base/action-button'
import { FileUploaderInChatInput } from '@/app/components/base/file-uploader'
import type { FileUpload } from '@/app/components/base/features/types'
import cn from '@/utils/classnames'
import sendIconImage from '@/app/assets/icons/send.png'

type OperationProps = {
  fileConfig?: FileUpload
  speechToTextConfig?: EnableType
  onShowVoiceInput?: () => void
  onSend: () => void
  theme?: Theme | null,
  ref?: Ref<HTMLDivElement>;
}
const Operation: FC<OperationProps> = ({
  ref,
  fileConfig,
  speechToTextConfig,
  onShowVoiceInput,
  onSend,
  theme,
}) => {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-end',
      )}
    >
      <div
        className='flex items-center pl-1'
        ref={ref}
      >
        <div className='flex items-center space-x-1'>
          {fileConfig?.enabled && <FileUploaderInChatInput fileConfig={fileConfig} />}
          {
            speechToTextConfig?.enabled && (
              <ActionButton
                size='l'
                onClick={onShowVoiceInput}
              >
                <RiMicLine className='h-5 w-5' />
              </ActionButton>
            )
          }
        </div>
        <Button
          className='ml-3 mr-3'
          variant='primary'
          onClick={onSend}
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
  )
}
Operation.displayName = 'Operation'

export default memo(Operation)
