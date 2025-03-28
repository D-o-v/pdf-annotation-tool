import { create } from 'zustand'
import { DocumentState, Annotation } from '@/types'

const useDocumentStore = create<DocumentState>((set) => ({
  document: null,
  annotations: [],
  currentTool: null,
  
  addAnnotation: (annotation: Annotation) => 
    set((state) => ({ 
      annotations: [...state.annotations, annotation] 
    })),
  
  removeAnnotation: (id: string) => 
    set((state) => ({
      annotations: state.annotations.filter(ann => ann.id !== id)
    })),
  
  setCurrentTool: (tool) => set({ currentTool: tool })
}))

export default useDocumentStore