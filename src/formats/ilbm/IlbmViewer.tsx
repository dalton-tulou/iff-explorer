import React from "react";
import type { IffFile } from "../../core/iff/IffFile";
import decodeBmhd from "./decodeBmhd";
import decodeCmap from "./decodeCmap";
import BitmapCanvas from "./BitmapCanvas";
import decodeBody from "./decodeBody";

export default function IlbmViewer({ file }: { file: IffFile }) {
  const bmhdChunk = file.chunks.find((c) => c.id === "BMHD");
  const bodyChunk = file.chunks.find((c) => c.id === "BODY");
  const cmapChunk = file.chunks.find((c) => c.id === "CMAP");

  const imageData = React.useMemo(() => {
    if (!bmhdChunk || !bodyChunk || !cmapChunk) {
      return null;
    }

    const { width, height, depth, compression } = decodeBmhd(bmhdChunk);
    const bitmap = decodeBody(bodyChunk, width, height, depth, compression);
    const colors = decodeCmap(cmapChunk);

    const data = new Uint8ClampedArray(width * height * 4);
    const chunky = new Uint8ClampedArray(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let colorIndex = 0;
        for (let z = 0; z < depth; z++) {
          const cols = ((width + 15) & -16) >> 3;
          const i = cols * depth * y + z * cols + (x >> 3);
          const bit = 7 - (x & 7);
          const bitValue = (bitmap[i] >> bit) & 1;
          colorIndex |= bitValue << z;
        }

        const color = colors[colorIndex] || "#000000";
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);

        const j = (y * width + x) * 4;
        data[j] = r;
        data[j + 1] = g;
        data[j + 2] = b;
        data[j + 3] = 255; // alpha channel

        chunky[y * width + x] = colorIndex;
      }
    }

    return { width, height, data, chunky };
  }, [bmhdChunk, bodyChunk, cmapChunk]);

  const [hoveredPixel, setHoveredPixel] = React.useState<{
    x: number;
    y: number;
    rgb: string;
    index: number;
  } | null>(null);

  const handleMouseMove = React.useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      if (!imageData) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const scaleX = imageData.width / rect.width;
      const scaleY = imageData.height / rect.height;

      const x = Math.floor((event.clientX - rect.left) * scaleX);
      const y = Math.floor((event.clientY - rect.top) * scaleY);

      if (x >= 0 && x < imageData.width && y >= 0 && y < imageData.height) {
        const colorIndex = imageData.chunky[y * imageData.width + x];

        const index = (y * imageData.width + x) * 4;
        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        const color = `#${[r, g, b]
          .map((c) => c.toString(16).padStart(2, "0"))
          .join("")}`;

        setHoveredPixel({ x, y, rgb: color, index: colorIndex });
      } else {
        setHoveredPixel(null);
      }
    },
    [imageData],
  );

  const handleMouseOut = React.useCallback(() => {
    setHoveredPixel(null);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {imageData ? (
        <>
          <BitmapCanvas
            bitmap={imageData.data}
            width={imageData.width}
            onMouseMove={handleMouseMove}
            onMouseOut={handleMouseOut}
          />
          {hoveredPixel ? (
            <div className="flex flex-row gap-4 font-mono">
              <span>
                Pixel: ({hoveredPixel.x.toString().padStart(3, "\u00A0")},{" "}
                {hoveredPixel.y.toString().padStart(3, "\u00A0")})
              </span>
              <span>Color: {hoveredPixel.rgb}</span>
              <span>
                Index: {hoveredPixel.index.toString().padStart(3, "\u00A0")}
              </span>
              <div
                className="w-4 h-4 border border-black"
                style={{ backgroundColor: hoveredPixel.rgb }}
              ></div>
            </div>
          ) : (
            <div>
              <span>&nbsp;</span>
            </div>
          )}
        </>
      ) : (
        <p>Missing BMHD, BODY, or CMAP chunk</p>
      )}
    </div>
  );
}
