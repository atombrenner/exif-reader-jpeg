export const readExifData: (pathOrStream: string | NodeJS.ReadableStream) => Promise<{
  bigEndian: boolean
  image: Record<string, any>
  thumbnail: Record<string, any>
  exif: Record<string, any>
}>

export const readExifBufferFile: (path: string) => Promise<Buffer>
export const readExifBufferStream: (stream: NodeJS.ReadableStream) => Promise<Buffer>
