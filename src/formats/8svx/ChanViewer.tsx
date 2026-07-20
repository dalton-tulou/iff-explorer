import type { IffChunk } from "../../core/iff/IffChunk";

export default function ChanViewer({ chunk }: { chunk: IffChunk }) {
  const view = new DataView(chunk.data);
  const channelMask = view.getUint32(0, false);
  const left = (channelMask >> 1) & 1;
  const right = (channelMask >> 2) & 1;

  return (
    <div>
      <h3>CHAN</h3>
      <p>Channel Mask: {channelMask.toString(16).padStart(8, "0")}</p>
      <p>Left Channel: {left ? "Yes" : "No"}</p>
      <p>Right Channel: {right ? "Yes" : "No"}</p>
    </div>
  );
}
