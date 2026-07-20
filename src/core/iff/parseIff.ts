import type { IffFile } from "./IffFile";
import type { IffChunk } from "./IffChunk";
import readFourCC from "./readFourCC";

export default function parseIff(
  buffer: ArrayBuffer,
  filename: string,
): IffFile {
  const dataView = new DataView(buffer);
  const id = readFourCC(dataView, 0);

  if (id !== "FORM") {
    throw new Error("Not a valid IFF file");
  }

  const size = dataView.getUint32(4, false);
  const formType = readFourCC(dataView, 8);

  const chunks: IffChunk[] = [];
  let offset = 12;
  while (offset < buffer.byteLength) {
    const chunkId = readFourCC(dataView, offset);
    let chunkSize = dataView.getUint32(offset + 4, false);

    if (chunkSize % 2 !== 0) {
      chunkSize += 1; // pad to even size
    }

    const chunkData = buffer.slice(offset + 8, offset + 8 + chunkSize);
    chunks.push({ id: chunkId, size: chunkSize, data: chunkData });
    offset += 8 + chunkSize;
  }

  return { id, size, formType, chunks, filename };
}
