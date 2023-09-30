// this is a index.d.ts test handled by [tsd](https://github.com/SamVerschueren/tsd#readme)
import { readExifData, readExifBufferFile, readExifBufferStream } from '.'
import { Readable } from 'node:stream'
import { expectType, expectError } from 'tsd'
import type { Exif } from 'exif-reader'

const fromFile = await readExifData('some.jpg')
expectError(fromFile.doesNotExist) // should be highlighted as an error in IDE but handled by tsd
expectType<boolean>(fromFile.bigEndian)
expectType<Exif>(fromFile)

const fromStream = await readExifData(Readable.from([]))
expectError(fromStream.doesNotExist) // should be highlighted as an error in IDE but handled by tsd
expectType<boolean>(fromStream.bigEndian)
expectType<Exif>(fromStream)

expectType<Promise<Buffer>>(readExifBufferStream(Readable.from([])))
expectType<Promise<Buffer>>(readExifBufferFile('some.jpg'))
