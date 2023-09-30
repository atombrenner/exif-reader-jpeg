import type { Exif } from 'exif-reader'

export const readExifData: (pathOrStream: string | NodeJS.ReadableStream) => Promise<Exif>

export const readExifBufferFile: (path: string) => Promise<Buffer>
export const readExifBufferStream: (stream: NodeJS.ReadableStream) => Promise<Buffer>
