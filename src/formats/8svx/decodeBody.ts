import type { IffChunk } from "../../core/iff/IffChunk";

export default function decodeBody(
  chunk: IffChunk,
  compression: number,
): Int8Array {
  if (compression) {
    throw new Error("Compressed 8SVX data is not supported yet.");
  }

  return new Int8Array(chunk.data);
}
