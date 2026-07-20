import type { IffChunk } from "../../core/iff/IffChunk";

export default function decodeBody(
  chunk: IffChunk,
  compression: number,
  stereo: boolean,
): Int8Array[] | null {
  if (compression) {
    return null;
  }

  if (stereo) {
    // left first then right
    return [
      new Int8Array(chunk.data.slice(0, chunk.data.byteLength / 2)),
      new Int8Array(chunk.data.slice(chunk.data.byteLength / 2)),
    ];
  } else {
    return [new Int8Array(chunk.data)];
  }
}
