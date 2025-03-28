export interface Annotation {
    id: string
    type: 'highlight' | 'text' | 'signature' | 'draw'
    color: string
    coordinates: {
      x: number
      y: number
      width?: number
      height?: number
    }
    content?: string
  }
  
  export interface DocumentState {
    document: File | null
    annotations: Annotation[]
    currentTool: 'draw' | 'highlight' | 'text' | 'signature' | null
    addAnnotation: (annotation: Annotation) => void
    removeAnnotation: (id: string) => void
    setCurrentTool: (tool: DocumentState['currentTool']) => void
  }