import { type JSX } from "react";
import type { IffChunk } from "../../core/iff/IffChunk";

export default function HexViewer({ chunk }: { chunk: IffChunk }) {
  const dataView = new DataView(chunk.data);
  const hexValues: string[] = [];

  for (let i = 0; i < chunk.size; i++) {
    const byte = dataView.getUint8(i);
    hexValues.push(byte.toString(16).padStart(2, "0"));
  }

  const bytesPerRow = 16;
  const rows: JSX.Element[] = [];
  for (let i = 0; i < hexValues.length; i += bytesPerRow) {
    const rowValues = hexValues.slice(i, i + bytesPerRow);
    rows.push(
      <div key={i}>
        {i.toString(16).padStart(8, "0")}: {rowValues.join(" ")}
      </div>,
    );
  }

  return (
    <div className="flex flex-col gap-4 items-start">
      <h3>{chunk.id}</h3>
      <pre className="font-mono text-left">{rows}</pre>
    </div>
  );
}
