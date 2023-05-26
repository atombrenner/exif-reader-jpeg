// this is a index.d.ts test handled by [tsd](https://github.com/SamVerschueren/tsd#readme)
import { readExifData, readExifBuffer } from '.'
import { Readable } from 'node:stream'
import { expectType, expectError } from 'tsd'

// TODO: once exif-reader has better typescript support, check the complete result type

const fromFile = await readExifData('some.jpg')
expectError(fromFile.doesNotExist) // should be highlighted as an error in IDE but handled by tsd
expectType<boolean>(fromFile.bigEndian)
expectType<Record<string, any>>(fromFile.image)

const fromStream = await readExifData(Readable.from([]))
expectError(fromStream.doesNotExist) // should be highlighted as an error in IDE but handled by tsd
expectType<boolean>(fromStream.bigEndian)
expectType<Record<string, any>>(fromStream.image)

expectType<Promise<Buffer>>(readExifBuffer('some.jpg'))
expectType<Promise<Buffer>>(readExifBuffer(Readable.from([])))
