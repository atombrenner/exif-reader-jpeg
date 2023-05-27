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
  bigEndian: false,
  Image: {
    ImageWidth: 2448,
    ImageLength: 3264,
    Make: 'Some Make',
    Model: 'Some Model',
    Orientation: 1,
    XResolution: 72,
    YResolution: 72,
    ResolutionUnit: 2,
    Software: 'HDR+ 1.0.520435816zd',
    DateTime: 2023-05-20T17:02:00.000Z,
    YCbCrPositioning: 1,
  },
  Thumbnail: {
    ImageWidth: 219,
    ImageLength: 292,
    Compression: 6,
    Orientation: 1,
    XResolution: 72,
    YResolution: 72,
    ResolutionUnit: 2,
  },
  Photo: {
    ExposureTime: 0.016679,
    FNumber: 2,
    ExposureProgram: 2,
    ISOSpeedRatings: 129,
    ExifVersion: Buffer(4) [Uint8Array] [ 48, 50, 51, 50 ],
    DateTimeOriginal: 2023-05-20T17:02:00.000Z,
    DateTimeDigitized: 2023-05-20T17:02:00.000Z,
    OffsetTime: '+02:00',
    OffsetTimeOriginal: '+02:00',
    OffsetTimeDigitized: '+02:00',
    ShutterSpeedValue: 5.91,
    ApertureValue: 2,
    BrightnessValue: 2.54,
    ExposureBiasValue: 0,
    MaxApertureValue: 2,
    SubjectDistance: 0.35,
    MeteringMode: 2,
    Flash: 16,
    FocalLength: 2.57,
    SubSecTime: '811',
    SubSecTimeOriginal: '811',
    SubSecTimeDigitized: '811',
    FlashpixVersion: Buffer(4) [Uint8Array] [ 48, 49, 48, 48 ],
    ColorSpace: 1,
    PixelXDimension: 2448,
    PixelYDimension: 3264,
    InteroperabilityTag: 958,
    SensingMethod: 2,
    CustomRendered: 1,
    ExposureMode: 0,
    WhiteBalance: 0,
    DigitalZoomRatio: 1.4,
    FocalLengthIn35mmFilm: 24,
    SceneCaptureType: 0,
    Contrast: 0,
    Saturation: 0,
    Sharpness: 0,
    SubjectDistanceRange: 1,
    LensMake: 'Some Lens Make',
    LensModel: 'Some front camera 2.57mm f/2.0',
    CompositeImage: 3
  },
  GPSInfo: {
    GPSLatitudeRef: 'N',
    GPSLatitude: [ 49, 1, 3.12 ],
    GPSLongitudeRef: 'E',
    GPSLongitude: [ 11, 1, 4.56 ],
    GPSAltitudeRef: 0,
    GPSAltitude: 296.1,
    GPSTimeStamp: [ 15, 1, 48 ],
    GPSImgDirectionRef: 'M',
    GPSImgDirection: 258,
    GPSDateStamp: '2023:05:20'
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
