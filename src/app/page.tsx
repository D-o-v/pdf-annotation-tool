'use client'

import React, { useState, useCallback } from 'react'
import { Upload, FileText, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import DocumentUploader from '@/components/DocumentUploader'
import PDFAnnotator from '@/components/PDFAnnotator'

export default function Home() {
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null)

  const handleDocumentUpload = useCallback((file: File) => {
    setUploadedDocument(file)
  }, [])

  const handleUploadNew = useCallback(() => {
    setUploadedDocument(null)
  }, [])

  // If no document is uploaded, show the upload page
  if (!uploadedDocument) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          <div className="p-12 text-center">
            <div className="mb-8">
              <FileText 
                size={64} 
                className="mx-auto text-indigo-500 mb-4 animate-pulse" 
              />
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Document Annotation Studio
              </h1>
              <p className="text-gray-600 mb-8">
                Seamlessly annotate, highlight, and sign your PDF documents with precision and ease.
              </p>
            </div>

            <DocumentUploader 
              onUpload={handleDocumentUpload}
              renderDropzone={(dropzoneState) => (
                <div 
                  {...dropzoneState.getRootProps()} 
                  className={`
                    border-2 border-dashed rounded-xl p-12 transition-all duration-300
                    ${dropzoneState.isDragActive 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-300 hover:border-indigo-400'
                    }
                    cursor-pointer group
                  `}
                >
                  <input {...dropzoneState.getInputProps()} />
                  <div className="flex flex-col items-center">
                    <Upload 
                      size={48} 
                      className={`
                        mb-4 transition-colors duration-300
                        ${dropzoneState.isDragActive 
                          ? 'text-indigo-600' 
                          : 'text-gray-400 group-hover:text-indigo-500'
                        }
                      `} 
                    />
                    <p className="text-gray-600 mb-2">
                      {dropzoneState.isDragActive 
                        ? 'Drop your PDF here' 
                        : 'Drag and drop PDF or Click to Upload'
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      Support for single PDF file upload (Max 10MB)
                    </p>
                  </div>
                </div>
              )}
            />

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle2 size={20} className="mr-2" />
                <span className="text-sm">Secure & Private</span>
              </div>
              <div className="flex items-center justify-center text-blue-600">
                <FileText size={20} className="mr-2" />
                <span className="text-sm">PDF Annotation Support</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // If document is uploaded, show the PDF Annotator
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-morphism p-6 rounded-xl shadow-glass">
          <PDFAnnotator 
            document={uploadedDocument} 
            onDocumentChange={setUploadedDocument}
            onUploadNew={handleUploadNew}
          />
        </div>
      </div>
    </div>
  )
}