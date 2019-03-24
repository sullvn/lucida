import * as React from 'react'

const noop = (): void => {}

function onChange(
  onUpload: (file: File) => void,
): (ev: React.ChangeEvent<HTMLInputElement>) => void {
  return ev => {
    const files = ev.target.files
    if (files === null || files.length === 0) {
      return
    }

    onUpload(files[0])
  }
}

interface FileUploadProps {
  onUpload?: (file: File) => void
}

/**
 * FileUpload component
 */
export function FileUpload({ onUpload = noop }: FileUploadProps): JSX.Element {
  return <input type="file" onChange={onChange(onUpload)} />
}
