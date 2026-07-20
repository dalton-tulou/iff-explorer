export default function decodeRow(
  dest: DataView,
  destIndex: number,
  src: DataView,
  srcIndex: number,
  numBytes: number,
) {
  const endDest = destIndex + numBytes;
  const srcIndexStart = srcIndex;

  while (destIndex < endDest) {
    let x = src.getInt8(srcIndex++);

    if (x >= 0) {
      while (x-- >= 0) {
        dest.setUint8(destIndex++, src.getUint8(srcIndex++));
      }
    } else if (x != -128) // rle
    {
      const y = src.getUint8(srcIndex++);

      while (x++ <= 0) {
        dest.setUint8(destIndex++, y);
      }
    }
  }

  // return the number of bytes read from the source
  return srcIndex - srcIndexStart;
}
