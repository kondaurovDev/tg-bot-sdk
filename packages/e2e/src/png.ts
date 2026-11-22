/**
 * @module png
 * A solid-colour PNG built in memory, so the uploads need no fixture files.
 */
import { crc32, deflateSync } from "node:zlib"

const chunk = (type: string, data: Uint8Array): Buffer => {
  const body = Buffer.concat([Buffer.from(type, "ascii"), data])
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const checksum = Buffer.alloc(4)
  checksum.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, checksum])
}

export const makePng = (
  width: number,
  height: number,
  [red, green, blue]: readonly [number, number, number]
): Uint8Array<ArrayBuffer> => {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8 // bit depth
  header[9] = 2 // colour type: RGB

  // Every scanline: a filter byte (0 = none), then the pixels
  const row = Buffer.alloc(1 + width * 3)
  for (let x = 0; x < width; x++) row.set([red, green, blue], 1 + x * 3)
  const pixels = Buffer.concat(Array.from({ length: height }, () => row))

  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(pixels)),
    chunk("IEND", new Uint8Array(0))
  ])
  return new Uint8Array(png)
}
