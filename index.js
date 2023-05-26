const { createReadStream } = require('node:fs')
const parseExifBuffer = require('exif-reader')

const readExifData = async (pathOrStream) => {
  const buffer = await readExifBuffer(pathOrStream)
  return buffer ? parseExifBuffer(buffer) : {}
}

const readExifBuffer = async (pathOrStream) => {
  const stream = typeof pathOrStream === 'string' ? createReadStream(pathOrStream) : pathOrStream

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

module.exports = { readExifData, readExifBuffer }
