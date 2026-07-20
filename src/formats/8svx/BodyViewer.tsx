import React from "react";
import type { IffChunk } from "../../core/iff/IffChunk";
import type { IffFile } from "../../core/iff/IffFile";
import decodeVhdr from "./decodeVhdr";
import BitmapCanvas from "../ilbm/BitmapCanvas";
import decodeBody from "./decodeBody";

export default function BodyViewer({
  chunk,
  file,
}: {
  chunk: IffChunk;
  file: IffFile;
}) {
  const vhdrChunk = file.chunks.find((c) => c.id === "VHDR");
  const vhdr = React.useMemo(
    () => vhdrChunk && decodeVhdr(vhdrChunk),
    [vhdrChunk],
  );

  const waveform = React.useMemo(() => {
    if (!vhdr) return null;
    if (vhdr.sCompression !== 0) {
      return null; // Only support uncompressed data for now
    }
    return decodeBody(chunk, vhdr.sCompression);
  }, [vhdr, chunk]);

  const imageData = React.useMemo(() => {
    if (!waveform) return null;
    const width = 512;
    const height = 256;

    const imageData = new Uint8ClampedArray(width * height * 4);
    for (let x = 0; x < width; x++) {
      let maxSample = -128;
      let minSample = 127;

      const i0 = Math.floor((x / width) * waveform.length);
      const i1 = Math.floor(((x + 1) / width) * waveform.length);

      for (let i = i0; i < i1; i++) {
        const sample = waveform[i];
        if (sample > maxSample) maxSample = sample;
        if (sample < minSample) minSample = sample;
      }
      // draw line from minSample to maxSample
      const yMax = maxSample + 128;
      const yMin = minSample + 128;
      for (let yy = yMin; yy <= yMax; yy++) {
        const offset = (yy * width + x) * 4;
        imageData[offset] = 0;
        imageData[offset + 1] = 0;
        imageData[offset + 2] = 0;
        imageData[offset + 3] = 255;
      }
    }

    return imageData;
  }, [waveform]);

  return (
    <div>
      <h3>BODY</h3>
      {imageData ? (
        <BitmapCanvas bitmap={imageData} width={imageData.length / 4 / 256} />
      ) : (
        <p>Unsupported or empty waveform data</p>
      )}
    </div>
  );
}
