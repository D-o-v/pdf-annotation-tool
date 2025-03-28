import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Annotation } from '@/types'

export const useAnnotationTools = () => {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [currentTool, setCurrentTool] = useState<Annotation['type'] | null>(null)

  const addAnnotation = (annotationData: Omit<Annotation, 'id'>) => {
    const newAnnotation: Annotation = {
      ...annotationData,
      id: uuidv4()
    }
    setAnnotations(prev => [...prev, newAnnotation])
  }

  const removeAnnotation = (annotationId: string) => {
    setAnnotations(prev => 
      prev.filter(annotation => annotation.id !== annotationId)
    )
  }

  const updateAnnotation = (
    annotationId: string, 
    updates: Partial<Annotation>
  ) => {
    setAnnotations(prev => 
      prev.map(annotation => 
        annotation.id === annotationId 
          ? { ...annotation, ...updates } 
          : annotation
      )
    )
  }

  return {
    annotations,
    currentTool,
    addAnnotation,
    removeAnnotation,
    updateAnnotation,
    setCurrentTool
  }
}