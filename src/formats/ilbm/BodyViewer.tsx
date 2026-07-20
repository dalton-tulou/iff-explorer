import React from "react";
import BitmapCanvas from "./BitmapCanvas";
import type { IffChunk } from "../../core/iff/IffChunk";
import decodeBmhd from "./decodeBmhd";
import decodeBody from "./decodeBody";
import type { IffFile } from "../../core/iff/IffFile";

export default function BodyViewer({
  chunk,
  file,
}: {
  chunk: IffChunk;
  file: IffFile;
}) {
  const [width, height, depth, compression, cols] = React.useMemo(() => {
    const bmhdChunk = file.chunks.find((c) => c.id === "BMHD");

    const { width, height, depth, compression } = bmhdChunk
      ? decodeBmhd(bmhdChunk)
      : { width: 0, height: 0, depth: 0, compression: 0 };

    const cols = ((width + 15) & -16) >> 3;

    return [width, height, depth, compression, cols];
  }, [file]);

  const imageData = React.useMemo(() => {
    const bitmap = decodeBody(chunk, width, height, depth, compression);
    // const cols = Math.floor((width + 15) / 16);
    const bitplanes: Uint8ClampedArray[] = [];

    for (let z = 0; z < depth; z++) {
      const bitplane = new Uint8ClampedArray(8 * cols * height * 4);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = cols * depth * y + z * cols + (x >> 3);
          const bit = 7 - (x & 7);
          const value = (bitmap[i] >> bit) & 1 ? 255 : 0;

          const j = (y * cols * 8 + x) * 4;
          bitplane[j] = value;
          bitplane[j + 1] = value;
          bitplane[j + 2] = value;
          bitplane[j + 3] = 255; // alpha channel
        }
      }
      bitplanes.push(bitplane);
    }

    return bitplanes;
  }, [chunk, width, height, depth, compression, cols]);

  return (
    <div className="flex flex-col gap-4">
      <h3>Bitmap body</h3>
      <div className="flex flex-wrap gap-4">
        {imageData.map((bitmap, index) => (
          <div key={index}>
            <h4>Bitplane {index}</h4>
            <BitmapCanvas bitmap={bitmap} width={cols * 8} />
          </div>
        ))}
      </div>
    </div>
  );
}
