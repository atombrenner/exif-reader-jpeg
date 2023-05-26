//import { Readable } from 'node:stream'

export const readExifData: (pathOrStream: string | NodeJS.ReadableStream) => Promise<{
  bigEndian: boolean
  image: Record<string, any>
  thumbnail: Record<string, any>
  exif: Record<string, any>
}>

export const readExifBuffer: (pathOrStream: string | NodeJS.ReadableStream) => Promise<Buffer>
