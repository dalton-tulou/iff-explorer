import type { IffChunk } from "../../core/iff/IffChunk";

export default function decodeBmhd(chunk: IffChunk) {
  const dataView = new DataView(chunk.data);
  const width = dataView.getUint16(0, false);
  const height = dataView.getUint16(2, false);
  const x = dataView.getInt16(4, false);
  const y = dataView.getInt16(6, false);
  const depth = dataView.getUint8(8); // number of bitplanes
  const masking = dataView.getUint8(9); // 0 = none, 1 = has mask, 2 = has transparent color
  const compression = dataView.getUint8(10); // 0 = none, 1 = RLE
  const transparentColor = dataView.getUint16(12, false);
  const xAspect = dataView.getUint8(14);
  const yAspect = dataView.getUint8(15);
  const pageWidth = dataView.getInt16(16, false);
  const pageHeight = dataView.getInt16(18, false);

  return {
    width,
    height,
    x,
    y,
    depth,
    masking,
    compression,
    transparentColor,
    xAspect,
    yAspect,
    pageWidth,
    pageHeight,
  };
}
