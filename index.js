const { open } = require('node:fs/promises')
const parseExifBuffer = require('@atombrenner/exif-reader')

// see https://en.wikipedia.org/wiki/JPEG_File_Interchange_Format for details of jpeg file format

const readExifData = async (pathOrStream) => {
  const buffer = await (typeof pathOrStream === 'string'
    ? readExifBufferFile(pathOrStream)
    : readExifBufferStream(pathOrStream))
  return buffer ? parseExifBuffer(buffer) : {}
}

const readExifBufferFile = async (path) => {
  const file = await open(path)
  const chunkSize = 4096
  try {
    const buffer = Buffer.allocUnsafe(64 * 1024) // max segment size

    const markerSize = 10
    let bufStart = 2
    let bufLen = 0

    for (;;) {
      bufLen = (await file.read(buffer, 0, chunkSize, bufStart)).bytesRead
      if (bufLen === 0) return undefined

      let i = 0
      const stop = bufLen - markerSize
      while (i <= stop) {
        const marker = readMarker(buffer, i)
        if (!marker) return undefined
        if (marker.exif) {
          if (i + marker.offset < bufLen) return buffer.subarray(i + 4, i + marker.offset)
          buffer.copyWithin(0, i + 4, bufLen)
          bufStart += i + 4
          bufLen -= i + 4
          bufLen += (await file.read(buffer, bufLen, marker.offset - bufLen - 4, bufStart + bufLen))
            .bytesRead
          if (bufLen !== marker.offset - 4) return undefined
          return buffer.subarray(0, bufLen)
        }
        i += marker.offset
      }
      bufStart += i
    }
  } finally {
    await file.close()
  }
}

const readMarker = (buffer, i) => {
  if (buffer[i] !== 0xff) return undefined // misaligned, not a marker
  const type = buffer[i + 1]
  if (!(type === 0xe0 || type === 0xe1)) return undefined // found non APP segment

  len = buffer.readUInt16BE(i + 2)

  const exif =
    buffer[i + 1] === 0xe1 &&
    buffer[i + 4] === 0x45 &&
    buffer[i + 5] === 0x78 &&
    buffer[i + 6] === 0x69 &&
    buffer[i + 7] === 0x66 &&
    buffer[i + 8] === 0x00 &&
    buffer[i + 9] === 0x00

  return { offset: len + 2, exif }
}

// the naive streaming algorithm is 4x slower than direct file access version above
const readExifBufferStream = async (stream) => {
  let buffer = undefined
  let exifBegin = 0
  let exifEnd = 0

  for await (const chunk of stream) {
    buffer = buffer ? Buffer.concat([buffer, chunk]) : chunk

    if (exifEnd === 0) {
      for (const stop = buffer.length - 9; exifBegin < stop; ++exifBegin) {
        if (buffer[exifBegin] !== 0xff) continue // not on a marker boundary
        if (isSOSMarker(buffer, exifBegin)) return undefined // no metadata present, exit early
        if (isExifMarker(buffer, exifBegin)) {
          const len = buffer.readUInt16BE(exifBegin + 2)
          exifBegin += 4
          exifEnd = exifBegin + len - 2
          break
        }
      }
    }

    if (exifEnd > 0 && exifEnd <= buffer.length) {
      return buffer.subarray(exifBegin, exifEnd)
    }
  }
}

const isExifMarker = (buffer, i) =>
  buffer[i + 1] === 0xe1 &&
  buffer[i + 4] === 0x45 &&
  buffer[i + 5] === 0x78 &&
  buffer[i + 6] === 0x69 &&
  buffer[i + 7] === 0x66 &&
  buffer[i + 8] === 0x0

const isSOSMarker = (buffer, i) => buffer[i + 1] === 0xda

module.exports = { readExifData, readExifBufferStream, readExifBufferFile }
