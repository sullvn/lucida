import * as React from 'react'

/**
 * FileUpload component
 */
export function FileUpload(props: FileUploadProps) {
  const { onUpload = noop } = props
  return <input type="file" onChange={onChange(onUpload)} />
}

interface FileUploadProps {
  onUpload?: (file: File) => void
}

const onChange = (onUpload: (file: File) => void) => (
  ev: React.ChangeEvent<HTMLInputElement>,
) => {
  const files = ev.target.files
  if (files === null || files.length === 0) {
    return
  }

  onUpload(files[0])
}

const noop = () => {}
