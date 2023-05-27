import { Readable } from 'node:stream'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readExifData, readExifBufferStream, readExifBufferFile } from './index.js'

describe('readExifBufferFile', () => {
  it('should exit if no valid jpeg segment is found', async () => {
    const buffer = await readExifBufferFile('LICENSE')
    assert.equal(buffer, undefined)
  })

  it('should return exif buffer for test.jpg', async () => {
    const buffer = await readExifBufferFile('test.jpg')
    assert.notEqual(buffer, undefined)
    assert.equal(buffer.length, 234)
    assert.deepEqual(
      buffer.subarray(0, 6),
      Buffer.from(new Uint8Array([0x45, 0x78, 0x69, 0x66, 0x00, 0x00]))
    )
  })
})

describe('readExifBufferStream', () => {
  const exifMarker = [0xff, 0xe1, 0x00, 0x08, 0x45, 0x78, 0x69, 0x66, 0x0, 0x0]
  const makeStream = (...chunks) => Readable.from(chunks.map((chunk) => new Uint8Array(chunk)))

  it('should return "undefined" for empty stream', async () => {
    const emptyStream = makeStream([])
    assert.equal(await readExifBufferStream(emptyStream), undefined)
  })

  it('should return "undefined" if no exif segment is found before SOS segement', async () => {
    const noExif = makeStream([0xff, 0xd8, 0x00, 0x00, 0xff, 0xda, 0x00, 0x00].concat(exifMarker))
    assert.equal(await readExifBufferStream(noExif), undefined)
  })

  it('should return "undefined" if no exif segment is present at all', async () => {
    const noExif = makeStream([0xff, 0xd8, 0xff, 0xe1, 0x00, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0])
    assert.equal(await readExifBufferStream(noExif), undefined)
  })

  it('should return exif buffer', async () => {
    const withExif = makeStream([0xff, 0xd8], exifMarker)
    const buffer = await readExifBufferStream(withExif)
    assert.equal(buffer.length, 6)
    assert.deepEqual(Array.from(buffer.values()), [0x45, 0x78, 0x69, 0x66, 0x0, 0x0])
  })

  it('should return exif chunk even if it is distributed over multiple chunks', async () => {
    const withExif = makeStream(
      [0xff, 0xd8, 0xff, 0xe1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      exifMarker.slice(0, 4),
      exifMarker.slice(4),
      [1, 2, 3, 4]
    )
    const buffer = await readExifBufferStream(withExif)
    assert.equal(buffer.length, 6)
    assert.deepEqual(Array.from(buffer.values()), [0x45, 0x78, 0x69, 0x66, 0x0, 0x0])
  })
})

it('readExifData should return parsed metadata from a jpeg file', async () => {
  const exif = await readExifData('test.jpg')
  assert.ok(exif.Photo.DateTimeOriginal instanceof Date, 'Date expected')
  assert.equal(exif.Photo.DateTimeOriginal.toISOString(), '2000-01-02T03:04:05.000Z')
})
