import type { IffChunk } from "../../core/iff/IffChunk";
import decodeCmap from "./decodeCmap";
import ColorCell from "./ColorCell";
import type { IffFile } from "../../core/iff/IffFile";

export default function CmapViewer({
  chunk,
}: {
  chunk: IffChunk;
  file: IffFile;
}) {
  const colors = decodeCmap(chunk);

  return (
    <div className="flex flex-col gap-4">
      <h3>Color Map</h3>
      <div className="flex flex-wrap gap-1">
        {colors.map((color, index) => (
          <ColorCell key={index} color={color} index={index} />
        ))}
      </div>
    </div>
  );
}
