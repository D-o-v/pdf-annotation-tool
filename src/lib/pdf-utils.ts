import { PDFDocument } from 'pdf-lib'

export async function embedAnnotationsToPDF(
  originalPDF: ArrayBuffer, 
  annotations: any[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(originalPDF)
  const pages = pdfDoc.getPages()

  annotations.forEach((annotation, index) => {
    const page = pages[index % pages.length]
 
    switch(annotation.type) {
      case 'text':
        page.drawText(annotation.content, {
          x: annotation.coordinates.x,
          y: annotation.coordinates.y,
          size: 12,
          color: annotation.color
        })
        break
      case 'highlight':
        page.drawRectangle({
          x: annotation.coordinates.x,
          y: annotation.coordinates.y,
          width: annotation.coordinates.width,
          height: annotation.coordinates.height,
          color: annotation.color,
          opacity: 0.5
        })
        break
    }
  })

  return await pdfDoc.save()
}