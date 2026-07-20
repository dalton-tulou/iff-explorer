import type { IffChunk } from "../../core/iff/IffChunk";

export default function decodeBody(
  chunk: IffChunk,
  compression: number,
): Int8Array | null {
  if (compression) {
    return null;
  }

  return new Int8Array(chunk.data);
}
