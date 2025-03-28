import { createUploadthing, type FileRouter } from "uploadthing/server"

const f = createUploadthing()

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async (req) => {
      return { userId: "user_123" }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete", { metadata, file })
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter