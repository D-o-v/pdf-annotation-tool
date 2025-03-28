

'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload} from 'lucide-react'
import toast from 'react-hot-toast'

interface DocumentUploaderProps {
  onUpload: (file: File) => void
  renderDropzone?: (dropzoneState: {
    isDragActive: boolean,
    getRootProps: () => React.HTMLAttributes<HTMLDivElement>,
    getInputProps: () => React.InputHTMLAttributes<HTMLInputElement>
  }) => React.ReactNode
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onUpload, renderDropzone }) => {
  const [isDragActive, setIsDragActive] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles.find(file => file.type === 'application/pdf')
    
    if (pdfFile) {
      onUpload(pdfFile)
      toast.success('PDF Successfully Uploaded')
    } else {
      toast.error('Please upload a valid PDF file')
    }
    setIsDragActive(false)
  }, [onUpload])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    maxSize: 10 * 1024 * 1024 // 10MB limit
  })

  const dropzoneState = {
    isDragActive,
    getRootProps,
    getInputProps
  }

  // If custom render prop is provided, use it
  if (renderDropzone) {
    return <>{renderDropzone(dropzoneState)}</>
  }

  // Default dropzone rendering
  return (
    <div 
      {...getRootProps()} 
      className={`
        border-2 border-dashed rounded-xl p-12 transition-all duration-300
        ${isDragActive 
          ? 'border-indigo-500 bg-indigo-50' 
          : 'border-gray-300 hover:border-indigo-400'
        }
        cursor-pointer group
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center">
        <Upload 
          size={48} 
          className={`
            mb-4 transition-colors duration-300
            ${isDragActive 
              ? 'text-indigo-600' 
              : 'text-gray-400 group-hover:text-indigo-500'
            }
          `} 
        />
        <p className="text-gray-600 mb-2">
          {isDragActive 
            ? 'Drop your PDF here' 
            : 'Drag and drop PDF or Click to Upload'
          }
        </p>
        <p className="text-sm text-gray-500">
          Support for single PDF file upload (Max 10MB)
        </p>
      </div>
    </div>
  )
}

export default DocumentUploader