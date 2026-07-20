import type { IffChunk } from "../../core/iff/IffChunk";
import decodeBmhd from "./decodeBmhd";
import type { IffFile } from "../../core/iff/IffFile";

export default function BmhdViewer({
  chunk,
}: {
  chunk: IffChunk;
  file: IffFile;
}) {
  const {
    width,
    height,
    x,
    y,
    depth,
    masking,
    compression,
    transparentColor,
    xAspect,
    yAspect,
    pageWidth,
    pageHeight,
  } = decodeBmhd(chunk);

  const props: [string, number][] = [
    ["Width", width],
    ["Height", height],
    ["X", x],
    ["Y", y],
    ["Depth", depth],
    ["Masking", masking],
    ["Compression", compression],
    ["Transparent Color", transparentColor],
    ["X Aspect", xAspect],
    ["Y Aspect", yAspect],
    ["Page Width", pageWidth],
    ["Page Height", pageHeight],
  ];

  return (
    <div className="flex flex-col gap-4">
      <h3>Bitmap Header</h3>
      <div className="grid grid-cols-2">
        {props.map(([label, value]) => (
          <>
            <div className="text-left">{label}</div>
            <div className="text-right">{value}</div>
          </>
        ))}
      </div>
    </div>
  );
}
