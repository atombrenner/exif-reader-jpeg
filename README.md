# exif-reader-jpeg

Read Exif metadata from a jpeg file.

## Usage

`npm i @atombrenner/exif-reader-jpeg`

```typescript
import { readExifData } from '@atombrenner/exif-reader-jpeg'

const exif = await readExifData('some.jpg') // path or stream

console.dir(exif)
```

Example Output:

```
{
  bigEndian: true,
  image: {
    XResolution: 300,
    YResolution: 300,
    ResolutionUnit: 2,
    YCbCrPositioning: 1
  },
  exif: {
    ExifVersion: Buffer(4) [Uint8Array] [ 48, 50, 51, 50 ],
    DateTimeOriginal: 2000-01-02T03:04:05.000Z,
    DateTimeDigitized: 2000-01-02T03:04:05.000Z,
    ComponentsConfiguration: Buffer(4) [Uint8Array] [ 1, 2, 3, 0 ],
    SubSecTimeOriginal: '123456',
    ColorSpace: 65535
  }
}
```

## Implementation Details

This is a companion to the [exif-reader package](https://www.npmjs.com/package/exif-reader).
It parses a `Buffer` with raw Exif data and returns an object with metadata.
You need to extract the raw metadata from a file on your own,
e.g. with [sharp](https://www.npmjs.com/package/sharp)'s metadata function.
This package reads and parses the Exif data from a jpeg file in one step.

`readExifData(pathOrStream: string | NodeJS.ReadableStream)` returns the parsed Exif metadata.
Note that streaming performs 4 times slower than the file version. The reason is that
streaming is reading the whole file, while the file version can read only the blocks with the metadata.

Use `readExifBufferFile` or `readExifBufferStream` if you are interested in the unparsed Exif Buffer.
