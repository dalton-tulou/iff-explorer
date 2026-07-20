import type { IffChunk } from "../../core/iff/IffChunk";

export default function decodeCmap(chunk: IffChunk): string[] {
  const dataView = new DataView(chunk.data);
  const numColors = chunk.size / 3;
  const colors: string[] = [];

  for (let i = 0; i < numColors; i++) {
    const r = dataView.getUint8(i * 3);
    const g = dataView.getUint8(i * 3 + 1);
    const b = dataView.getUint8(i * 3 + 2);

    colors.push(
      `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`,
    );
  }

  return colors;
}
