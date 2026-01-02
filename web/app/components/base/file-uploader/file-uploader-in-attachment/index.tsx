import FileFromLinkOrLocal from '../file-from-link-or-local'
import {
  FileContextProvider,
  useStore,
} from '../store'
import type { FileEntity } from '../types'
import { useFile } from '../hooks'
import FileItem from './file-item'
import type { FileUpload } from '@/app/components/base/features/types'
import { TransferMethod } from '@/types/app'

type Option = {
  value: string
  label: string
  icon: React.JSX.Element
}
type FileUploaderInAttachmentProps = {
  isDisabled?: boolean
  fileConfig: FileUpload
}
const FileUploaderInAttachment = ({
  isDisabled,
  fileConfig,
}: FileUploaderInAttachmentProps) => {
  const files = useStore(s => s.files)
  const {
    handleRemoveFile,
    handleReUploadFile,
  } = useFile(fileConfig)

  const showLocalUpload = fileConfig?.allowed_file_upload_methods?.includes(TransferMethod.local_file)
  const showRemoteUrl = fileConfig?.allowed_file_upload_methods?.includes(TransferMethod.remote_url)

  return (
    <div>
      {!isDisabled && (showLocalUpload || showRemoteUrl) && (
        <FileFromLinkOrLocal
          showFromLocal={showLocalUpload}
          showFromLink={showRemoteUrl}
          trigger={() => <></>}
          fileConfig={fileConfig}
          inline
        />
      )}
      <div className='mt-2 space-y-1'>
        {
          files.map(file => (
            <FileItem
              key={file.id}
              file={file}
              showDeleteAction={!isDisabled}
              showDownloadAction={false}
              onRemove={() => handleRemoveFile(file.id)}
              onReUpload={() => handleReUploadFile(file.id)}
              canPreview={fileConfig.preview_config?.file_type_list?.includes(file.type)}
              previewMode={fileConfig.preview_config?.mode}
            />
          ))
        }
      </div>
    </div>
  )
}

export type FileUploaderInAttachmentWrapperProps = {
  value?: FileEntity[]
  onChange: (files: FileEntity[]) => void
  fileConfig: FileUpload
  isDisabled?: boolean
}
const FileUploaderInAttachmentWrapper = ({
  value,
  onChange,
  fileConfig,
  isDisabled,
}: FileUploaderInAttachmentWrapperProps) => {
  return (
    <FileContextProvider
      value={value}
      onChange={onChange}
    >
      <FileUploaderInAttachment isDisabled={isDisabled} fileConfig={fileConfig} />
    </FileContextProvider>
  )
}

export default FileUploaderInAttachmentWrapper
