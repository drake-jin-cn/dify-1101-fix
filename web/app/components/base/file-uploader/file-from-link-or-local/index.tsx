import {
  memo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { RiUploadCloud2Line } from '@remixicon/react'
import FileInput from '../file-input'
import { useFile } from '../hooks'
import { useStore } from '../store'
import { FILE_URL_REGEX } from '../constants'
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/app/components/base/portal-to-follow-elem'
import Button from '@/app/components/base/button'
import type { FileUpload } from '@/app/components/base/features/types'
import cn from '@/utils/classnames'
import uploadIcon from '@/app/assets/icons/upload-outline.svg'
import uploadSolidIcon from '@/app/assets/icons/upload-solid.svg'
import uploadDisabledIcon from '@/app/assets/icons/upload-outline-disabled.svg'
type FileFromLinkOrLocalProps = {
  showFromLink?: boolean
  showFromLocal?: boolean
  trigger: (open: boolean) => React.ReactNode
  fileConfig: FileUpload
  inline?: boolean
}
const FileFromLinkOrLocal = ({
  showFromLink = true,
  showFromLocal = true,
  trigger,
  fileConfig,
  inline = false,
}: FileFromLinkOrLocalProps) => {
  const { t } = useTranslation()
  const files = useStore(s => s.files)
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [showError, setShowError] = useState(false)
  const { handleLoadFileFromLink } = useFile(fileConfig)
  const disabled = !!fileConfig.number_limits && files.length >= fileConfig.number_limits

  const handleSaveUrl = () => {
    if (!url)
      return

    if (!FILE_URL_REGEX.test(url)) {
      setShowError(true)
      return
    }
    handleLoadFileFromLink(url)
    setUrl('')
  }

  if (inline) {
    return (
      <div className='flex items-center gap-2'>
        {
          showFromLocal && (
            <Button
              className={cn(
                'relative !h-9 shrink-0 !gap-2 rounded-full !border !px-4 backdrop-blur-[4px]',
                disabled ? '!border-[#7F7F7F] !bg-[#F2F3F7]' : '!border-[#001965]',
              )}
              variant='secondary'
              disabled={disabled}
            >
              <img src={disabled ? uploadDisabledIcon.src : uploadIcon.src} className="h-4 w-4 shrink-0" />
              {t('common.fileUploader.uploadFromComputer')}
              <FileInput fileConfig={fileConfig} />
            </Button>
          )
        }
        {
          showFromLink && (
            <div className='flex-1'>
              <div className={cn(
                'flex h-9 items-center rounded-full border px-3 shadow-xs',
                showError && 'border-components-input-border-destructive',
                !showError && (disabled ? 'border-[#7F7F7F] bg-[#F2F3F7]' : 'border-[#E9EBF2]'),
              )}>
                <input
                  className='system-sm-regular block grow appearance-none bg-transparent outline-none'
                  placeholder={t('common.fileUploader.pasteFileLinkInputPlaceholder') || ''}
                  value={url}
                  onChange={(e) => {
                    setShowError(false)
                    setUrl(e.target.value.trim())
                  }}
                  disabled={disabled}
                />
                <Button
                  variant='primary'
                  disabled={!url || disabled}
                  onClick={handleSaveUrl}
                  style={{
                    width: '48px',
                    height: '24px',
                    borderRadius: '12px',
                    background: (!url || disabled) ? '#7F7F7F' : 'linear-gradient(252.56deg, #001965 0.09%, #446CFA 99.91%)',
                    border: 'none',
                    padding: 0,
                  }}
                  className='shrink-0'
                >
                  <img src={uploadSolidIcon.src} alt="" className="h-4 w-4" />
                </Button>
              </div>
              {
                showError && (
                  <div className='body-xs-regular mt-1 text-text-destructive'>
                    {t('common.fileUploader.pasteFileLinkInvalid')}
                  </div>
                )
              }
            </div>
          )
        }
      </div>
    )
  }

  return (
    <PortalToFollowElem
      placement='top'
      offset={4}
      open={open}
      onOpenChange={setOpen}
    >
      <PortalToFollowElemTrigger onClick={() => setOpen(v => !v)} asChild>
        {trigger(open)}
      </PortalToFollowElemTrigger>
      <PortalToFollowElemContent className='z-[1001]'>
        <div className='w-[280px] rounded-xl border-[0.5px] border-components-panel-border bg-components-panel-bg-blur p-3 shadow-lg'>
          {
            showFromLink && (
              <>
                <div className={cn(
                  'flex h-8 items-center rounded-lg border border-components-input-border-active bg-components-input-bg-active p-1 shadow-xs',
                  showError && 'border-components-input-border-destructive',
                )}>
                  <input
                    className='system-sm-regular mr-0.5 block grow appearance-none bg-transparent px-1 outline-none'
                    placeholder={t('common.fileUploader.pasteFileLinkInputPlaceholder') || ''}
                    value={url}
                    onChange={(e) => {
                      setShowError(false)
                      setUrl(e.target.value.trim())
                    }}
                    disabled={disabled}
                  />
                  <Button
                    className='shrink-0'
                    size='small'
                    variant='primary'
                    disabled={!url || disabled}
                    onClick={handleSaveUrl}
                  >
                    {t('common.operation.ok')}
                  </Button>
                </div>
                {
                  showError && (
                    <div className='body-xs-regular mt-0.5 text-text-destructive'>
                      {t('common.fileUploader.pasteFileLinkInvalid')}
                    </div>
                  )
                }
              </>
            )
          }
          {
            showFromLink && showFromLocal && (
              <div className='system-2xs-medium-uppercase flex h-7 items-center p-2 text-text-quaternary'>
                <div className='mr-2 h-px w-[93px] bg-gradient-to-l from-[rgba(16,24,40,0.08)]' />
                OR
                <div className='ml-2 h-px w-[93px] bg-gradient-to-r from-[rgba(16,24,40,0.08)]' />
              </div>
            )
          }
          {
            showFromLocal && (
              <Button
                className='relative w-full'
                variant='secondary-accent'
                disabled={disabled}
              >
                <RiUploadCloud2Line className='mr-1 h-4 w-4' />
                {t('common.fileUploader.uploadFromComputer')}
                <FileInput fileConfig={fileConfig} />
              </Button>
            )
          }
        </div>
      </PortalToFollowElemContent>
    </PortalToFollowElem>
  )
}

export default memo(FileFromLinkOrLocal)
