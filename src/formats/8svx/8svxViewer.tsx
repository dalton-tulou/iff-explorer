import React from "react";
import decodeBody from "./decodeBody";
import WaveformView from "./WaveformView";
import type { IffFile } from "../../core/iff/IffFile";
import decodeVhdr from "./decodeVhdr";

export default function SvxViewer({ file }: { file: IffFile }) {
  const vhdrChunk = file.chunks.find((chunk) => chunk.id === "VHDR");
  const bodyChunk = file.chunks.find((chunk) => chunk.id === "BODY");
  const chanChunk = file.chunks.find((chunk) => chunk.id === "CHAN");

  const { samples, sr } = React.useMemo(() => {
    if (!vhdrChunk || !bodyChunk) {
      return {};
    }

    let stereo = false;
    if (chanChunk) {
      const view = new DataView(chanChunk.data);
      const channelMask = view.getUint32(0, false);
      stereo = (channelMask & 6) === 6; // Example check for stereo channels
    }

    const vhdr = decodeVhdr(vhdrChunk);
    const samples = decodeBody(bodyChunk, vhdr.sCompression, stereo);
    const sr = vhdr.samplesPerSec;

    return { samples, sr };
  }, [vhdrChunk, bodyChunk, chanChunk]);

  return (
    <div className="flex flex-col gap-4">
      <h2>8SVX File: {file.filename}</h2>
      {samples ? (
        <WaveformView waveform={samples} sr={sr} />
      ) : (
        <p>Missing VHDR or BODY chunk</p>
      )}
    </div>
  );
}
