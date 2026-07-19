import React, { type JSX } from "react";
import "./App.css";

type IffChunk<T = string> = {
  id: T;
  size: number;
  data: ArrayBuffer;
};

type Iff = {
  filename: string;
  id: "FORM";
  size: number;
  formType: string;
  chunks: IffChunk[];
};

function App() {
  const [iff, setIff] = React.useState<Iff | null>(null);

  const handleFileUpload = (file: File) => {
    const filename = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer;

      try {
        const iff = parseIff(buffer, filename);
        setIff(iff);
      } catch (error) {
        window.alert("Error parsing IFF file: " + (error as Error).message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const [isDragingOver, setIsDragingOver] = React.useState(false);
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragingOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragingOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragingOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  React.useEffect(() => {
    const handleWindowDragOver = (event: DragEvent) => {
      event.preventDefault();
      setIsDragingOver(true);
    };

    const handleWindowDragLeave = (event: DragEvent) => {
      event.preventDefault();
      setIsDragingOver(false);
    };

    const handleWindowDrop = (event: DragEvent) => {
      event.preventDefault();
      setIsDragingOver(false);
      const file = event.dataTransfer?.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    };

    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("dragleave", handleWindowDragLeave);
    window.addEventListener("drop", handleWindowDrop);

    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("dragleave", handleWindowDragLeave);
      window.removeEventListener("drop", handleWindowDrop);
    };
  }, []);

  return (
    <div
      className="w-full flex-1"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragingOver ? (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg text-center">
            <p>Drop the file to upload</p>
          </div>
        </div>
      ) : (
        <div className="w-full flex-1 flex flex-col items-start">
          <div className="w-full flex flex-row justify-between items-center p-4">
            <h1>Dalton's IFF Explorer</h1>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
              style={{ display: "none" }}
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              style={{
                cursor: "pointer",
                color: "blue",
                textDecoration: "underline",
              }}
            >
              Click to select a file
            </label>
          </div>
          <div className="w-full flex-1 flex flex-col items-center justify-center p-4">
            {iff ? <IffViewer iff={iff} /> : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

function readFourCC(dataView: DataView, offset: number): string {
  return String.fromCharCode(
    dataView.getUint8(offset),
    dataView.getUint8(offset + 1),
    dataView.getUint8(offset + 2),
    dataView.getUint8(offset + 3),
  );
}

function parseIff(buffer: ArrayBuffer, filename: string): Iff {
  const dataView = new DataView(buffer);
  const id = readFourCC(dataView, 0);

  if (id !== "FORM") {
    throw new Error("Not a valid IFF file");
  }

  const size = dataView.getUint32(4, false);
  const formType = readFourCC(dataView, 8);

  const chunks: IffChunk[] = [];
  let offset = 12;
  while (offset < buffer.byteLength) {
    const chunkId = readFourCC(dataView, offset);
    let chunkSize = dataView.getUint32(offset + 4, false);

    if (chunkSize % 2 !== 0) {
      chunkSize += 1; // pad to even size
    }

    const chunkData = buffer.slice(offset + 8, offset + 8 + chunkSize);
    chunks.push({ id: chunkId, size: chunkSize, data: chunkData });
    offset += 8 + chunkSize;
  }

  return { id, size, formType, chunks, filename };
}

function IffViewer({ iff }: { iff: Iff }) {
  const [selectedChunk, setSelectedChunk] = React.useState<IffChunk | null>(
    null,
  );

  return (
    <div className="flex flex-col gap-4 w-full flex-1">
      <h2>Filename: {iff.filename}</h2>
      <div className="flex flex-row gap-4">
        <div className="p-4 bg-slate-100 gap-4 flex flex-col">
          <h3>Chunks</h3>
          <select
            size={iff.chunks.length + 1}
            className="font-mono bg-white border border-gray-400 p-2 w-full"
            onChange={(e) =>
              setSelectedChunk(iff.chunks[parseInt(e.target.value)])
            }
            value={
              selectedChunk
                ? iff.chunks.indexOf(selectedChunk).toString()
                : "-1"
            }
          >
            <option key={-1} value={-1}>
              {iff.formType.padEnd(7, "\u00A0")}
              {iff.size.toString().padStart(8, "\u00A0")}
            </option>
            {iff.chunks.map((chunk, index) => (
              <option key={index} value={index}>
                {index === iff.chunks.length - 1 ? "└─" : "├─"}
                {chunk.id.padEnd(4, "\u00A0")}{" "}
                {chunk.size.toString().padStart(8, "\u00A0")}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 p-4 bg-slate-100 flex-flex flex-col gap-4">
          {selectedChunk ? (
            <ChunkViewer iff={iff} chunk={selectedChunk} />
          ) : (
            <IlbmViewer iff={iff} />
          )}
        </div>
      </div>
    </div>
  );
}

function ChunkViewer({ chunk, iff }: { chunk: IffChunk; iff: Iff }) {
  return chunk.id === "BMHD" ? (
    <BmhdViewer chunk={chunk as IffChunk<"BMHD">} />
  ) : chunk.id === "CMAP" ? (
    <CmapViewer chunk={chunk as IffChunk<"CMAP">} />
  ) : chunk.id === "BODY" ? (
    <BodyViewer chunk={chunk as IffChunk<"BODY">} iff={iff} />
  ) : chunk.id === "CRNG" ? (
    <CrngViewer chunk={chunk as IffChunk<"CRNG">} />
  ) : (
    <HexViewer chunk={chunk} />
  );
}

function BmhdViewer({ chunk }: { chunk: IffChunk<"BMHD"> }) {
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

function CmapViewer({ chunk }: { chunk: IffChunk<"CMAP"> }) {
  const colors = decodeCmap(chunk);

  return (
    <div className="flex flex-col gap-4">
      <h3>Color Map</h3>
      <div className="flex flex-wrap gap-1">{colors.map(colorCell)}</div>
    </div>
  );
}

function colorCell(color: string, index: number): JSX.Element {
  return (
    <div
      key={index}
      className="w-8 h-8 inline-block border border-solid border-black"
      style={{
        backgroundColor: color,
      }}
      title={`${index}: ${color}`}
    ></div>
  );
}

function HexViewer({ chunk }: { chunk: IffChunk<string> }) {
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

function decodeBmhd(chunk: IffChunk<"BMHD">) {
  const dataView = new DataView(chunk.data);
  const width = dataView.getUint16(0, false);
  const height = dataView.getUint16(2, false);
  const x = dataView.getInt16(4, false);
  const y = dataView.getInt16(6, false);
  const depth = dataView.getUint8(8); // number of bitplanes
  const masking = dataView.getUint8(9); // 0 = none, 1 = has mask, 2 = has transparent color
  const compression = dataView.getUint8(10); // 0 = none, 1 = RLE
  const transparentColor = dataView.getUint16(12, false);
  const xAspect = dataView.getUint8(14);
  const yAspect = dataView.getUint8(15);
  const pageWidth = dataView.getInt16(16, false);
  const pageHeight = dataView.getInt16(18, false);

  return {
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
  };
}

function decodeCmap(chunk: IffChunk<"CMAP">): string[] {
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

function BodyViewer({ chunk, iff }: { chunk: IffChunk<"BODY">; iff: Iff }) {
  const [width, height, depth, compression, cols] = React.useMemo(() => {
    const bmhdChunk = iff.chunks.find((c) => c.id === "BMHD") as
      | IffChunk<"BMHD">
      | undefined;

    const { width, height, depth, compression } = bmhdChunk
      ? decodeBmhd(bmhdChunk)
      : { width: 0, height: 0, depth: 0, compression: 0 };

    const cols = ((width + 15) & -16) >> 3;

    return [width, height, depth, compression, cols];
  }, [iff]);

  const imageData = React.useMemo(() => {
    const bitmap = decodeBody(chunk, width, height, depth, compression);
    // const cols = Math.floor((width + 15) / 16);
    const bitplanes: Uint8ClampedArray[] = [];

    for (let z = 0; z < depth; z++) {
      const bitplane = new Uint8ClampedArray(8 * cols * height * 4);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = cols * depth * y + z * cols + (x >> 3);
          const bit = 7 - (x & 7);
          const value = (bitmap[i] >> bit) & 1 ? 255 : 0;

          const j = (y * cols * 8 + x) * 4;
          bitplane[j] = value;
          bitplane[j + 1] = value;
          bitplane[j + 2] = value;
          bitplane[j + 3] = 255; // alpha channel
        }
      }
      bitplanes.push(bitplane);
    }

    return bitplanes;
  }, [chunk, width, height, depth, compression, cols]);

  return (
    <div className="flex flex-col gap-4">
      <h3>Bitmap body</h3>
      <div className="flex flex-wrap gap-4">
        {imageData.map((bitmap, index) => (
          <div key={index}>
            <h4>Bitplane {index}</h4>
            <BitmapCanvas bitmap={bitmap} width={cols * 8} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BitmapCanvas({
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
        const imageData = new ImageData(bitmap, width, height);
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

function decodeBody(
  chunk: IffChunk<"BODY">,
  width: number,
  height: number,
  depth: number,
  compression: number,
): Uint8ClampedArray {
  const cols = ((width + 15) & -16) >> 3;
  const output = new Uint8ClampedArray(width * cols * depth);

  const outputDataView = new DataView(output.buffer);
  let outputIndex = 0;

  const inputDataView = new DataView(chunk.data);
  let inputIndex = 0;

  for (let y = 0; y < height; y++) {
    for (let z = 0; z < depth; z++) {
      if (compression) {
        const numBytesRead = decodeRow(
          outputDataView,
          outputIndex,
          inputDataView,
          inputIndex,
          cols,
        );
        inputIndex += numBytesRead;
        outputIndex += cols;
      } else {
        for (let i = 0; i < cols; i++) {
          inputDataView.setUint8(
            outputIndex++,
            inputDataView.getUint8(inputIndex++),
          );
        }
      }
    }
  }

  return output;
}

function decodeRow(
  dest: DataView,
  destIndex: number,
  src: DataView,
  srcIndex: number,
  numBytes: number,
) {
  const endDest = destIndex + numBytes;
  const srcIndexStart = srcIndex;

  while (destIndex < endDest) {
    let x = src.getInt8(srcIndex++);

    if (x >= 0) {
      while (x-- >= 0) {
        dest.setUint8(destIndex++, src.getUint8(srcIndex++));
      }
    } else if (x != -128) // rle
    {
      const y = src.getUint8(srcIndex++);

      while (x++ <= 0) {
        dest.setUint8(destIndex++, y);
      }
    }
  }

  // return the number of bytes read from the source
  return srcIndex - srcIndexStart;
}

function CrngViewer({ chunk }: { chunk: IffChunk<"CRNG"> }) {
  const dataView = new DataView(chunk.data);
  const rate = dataView.getUint16(2, false);
  const flags = dataView.getUint16(4, false);
  const low = dataView.getUint8(6);
  const high = dataView.getUint8(7);

  // The units are such that a rate of 60 steps per second is represented as 2^14 = 16384. Slower rates can be obtained by linear scaling: for 30 steps/second, rate = 8192; for 1 step/second, rate = 16384/60 ~273.

  const stepsPerSecond = (rate / 16384) * 60;

  const isActive = (flags & 1) !== 0;
  const isReverse = (flags & 2) !== 0;

  return (
    <div className="flex flex-col gap-4">
      <h3>Color Range</h3>
      <div>
        <div className="flex flex-row gap-4">
          <span className="flex-1 text-left">Rate</span>
          <span className="flex-1">
            {rate} ({stepsPerSecond} fps)
          </span>
        </div>
        <div className="flex flex-row gap-4">
          <span className="flex-1 text-left">Active</span>
          <span className="flex-1">{isActive ? "Yes" : "No"}</span>
        </div>
        <div className="flex flex-row gap-4">
          <span className="flex-1 text-left">Reverse</span>
          <span className="flex-1">{isReverse ? "Yes" : "No"}</span>
        </div>
        <div className="flex flex-row gap-4">
          <span className="flex-1 text-left">Low</span>
          <span className="flex-1">{low}</span>
        </div>
        <div className="flex flex-row gap-4">
          <span className="flex-1 text-left">High</span>
          <span className="flex-1">{high}</span>
        </div>
      </div>
    </div>
  );
}

function IlbmViewer({ iff }: { iff: Iff }) {
  const bmhdChunk = iff.chunks.find((c) => c.id === "BMHD") as
    | IffChunk<"BMHD">
    | undefined;

  const bodyChunk = iff.chunks.find((c) => c.id === "BODY") as
    | IffChunk<"BODY">
    | undefined;

  const cmapChunk = iff.chunks.find((c) => c.id === "CMAP") as
    | IffChunk<"CMAP">
    | undefined;

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
