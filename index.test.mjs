import { Readable } from 'node:stream'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readExifData, readExifBuffer } from './index.js'

it('readExifData should return parsed metadata from a jpeg file', async () => {
  const exif = await readExifData('test.jpg')
  assert.ok(exif.exif.DateTimeOriginal instanceof Date, 'Date expected')
  assert.equal(exif.exif.DateTimeOriginal.toISOString(), '2000-01-02T03:04:05.000Z')
})

describe('readExifBuffer', () => {
  const exifMarker = [0xff, 0xe1, 0x00, 0x08, 0x45, 0x78, 0x69, 0x66, 0x0, 0x0]
  const makeStream = (...chunks) => Readable.from(chunks.map((chunk) => new Uint8Array(chunk)))

  it('should return "undefined" for empty stream', async () => {
    const emptyStream = makeStream([])
    assert.equal(await readExifBuffer(emptyStream), undefined)
  })

  it('should return "undefined" if no exif segment is found before SOS segement', async () => {
    const noExif = makeStream([0xff, 0xd8, 0x00, 0x00, 0xff, 0xda, 0x00, 0x00].concat(exifMarker))
    assert.equal(await readExifBuffer(noExif), undefined)
  })

  it('should return "undefined" if no exif segment is present at all', async () => {
    const noExif = makeStream([0xff, 0xd8, 0xff, 0xe1, 0x00, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0])
    assert.equal(await readExifBuffer(noExif), undefined)
  })

  it('should return exif buffer', async () => {
    const withExif = makeStream([0xff, 0xd8], exifMarker)
    const buffer = await readExifBuffer(withExif)
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
    const buffer = await readExifBuffer(withExif)
    assert.equal(buffer.length, 6)
    assert.deepEqual(Array.from(buffer.values()), [0x45, 0x78, 0x69, 0x66, 0x0, 0x0])
  })
})
