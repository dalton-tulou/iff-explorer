import type { IffChunk } from "../../core/iff/IffChunk";
import decodeRow from "./decodeRow";

export default function decodeBody(
  chunk: IffChunk,
  width: number,
  height: number,
  depth: number,
  compression: number,
): Uint8ClampedArray {
  const cols = ((width + 15) & -16) >> 3;
  const output = new Uint8ClampedArray(width * cols * depth);

  const outputDataView = new DataView(output.buffer);
  let outputIndex = 0;

  const inputDataView = new DataView(chunk.data);
  let inputIndex = 0;

  for (let y = 0; y < height; y++) {
    for (let z = 0; z < depth; z++) {
      if (compression) {
        const numBytesRead = decodeRow(
          outputDataView,
          outputIndex,
          inputDataView,
          inputIndex,
          cols,
        );
        inputIndex += numBytesRead;
        outputIndex += cols;
      } else {
        for (let i = 0; i < cols; i++) {
          inputDataView.setUint8(
            outputIndex++,
            inputDataView.getUint8(inputIndex++),
          );
        }
      }
    }
  }

  return output;
}
