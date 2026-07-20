import type { IffChunk } from "../../core/iff/IffChunk";

export default function decodeVhdr(chunk: IffChunk): {
  oneShotHiSamples: number;
  repeatHiSamples: number;
  samplesPerHiCycle: number;
  samplesPerSec: number;
  ctOctave: number;
  sCompression: number;
  volume: number;
} {
  if (chunk.id !== "VHDR") {
    throw new Error(`Invalid chunk type: ${chunk.id}. Expected VHDR.`);
  }

  const dataView = new DataView(chunk.data);

  return {
    oneShotHiSamples: dataView.getUint32(0, false),
    repeatHiSamples: dataView.getUint32(4, false),
    samplesPerHiCycle: dataView.getUint32(8, false),
    samplesPerSec: dataView.getUint16(12, false),
    ctOctave: dataView.getUint8(14),
    sCompression: dataView.getUint8(15),
    volume: dataView.getInt32(16, false) / 0x10000, // Fixed point 16.16
  };
}
