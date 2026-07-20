import React from "react";

export default function BitmapCanvas({
  bitmap,
  width,
  onMouseMove,
  onMouseOver,
  onMouseOut,
}: {
  bitmap: Uint8ClampedArray;
  width: number;
  onMouseMove?: (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
  ) => void;
  onMouseOver?: (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
  ) => void;
  onMouseOut?: (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void;
}) {
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const height = bitmap.length / (width * 4);

  React.useEffect(() => {
    if (canvas.current) {
      const ctx = canvas.current.getContext("2d");
      if (ctx) {
        const imageDataArray = new Uint8ClampedArray(bitmap);
        const imageData = new ImageData(imageDataArray, width, height);
        ctx.putImageData(imageData, 0, 0);
      }
    }
  }, [bitmap, width, height]);

  return (
    <canvas
      ref={canvas}
      width={width}
      height={height}
      onMouseMove={onMouseMove}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      className="[image-rendering:pixelated]"
    />
  );
}
