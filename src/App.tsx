import React, { type JSX } from "react";
import "./App.css";
import DropZone from "./DropZone";

type IffChunk<T = string> = {
  id: T;
  size: number;
  data: ArrayBuffer;
};

type Iff = {
  id: "FORM";
  size: number;
  formType: string;
  chunks: IffChunk[];
};

function App() {
  const [iff, setIff] = React.useState<Iff | null>(null);

  const handleFileUpload = (file: File) => {
    console.log("File uploaded:", file);
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer;

      try {
        const iff = parseIff(buffer);
        setIff(iff);
      } catch (error) {
        window.alert("Error parsing IFF file: " + (error as Error).message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-4">
      {iff ? (
        <IffViewer iff={iff} />
      ) : (
        <DropZone
          onFileUpload={handleFileUpload}
          acceptedMimeTypes={[
            "application/x-iff",
            "image/x-iff",
            "audio/x-iff",
            "video/x-iff",
          ]}
        />
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

function parseIff(buffer: ArrayBuffer): Iff {
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

  return { id, size, formType, chunks };
}

function IffViewer({ iff }: { iff: Iff }) {
  const [selectedChunk, setSelectedChunk] = React.useState<IffChunk | null>(
    null,
  );

  return (
    <div className="flex flex-row gap-4 w-full flex-1">
      <div>
        <h2>IFF File: {iff.formType}</h2>
        <p>Size: {iff.size} bytes</p>
        <h3>Chunks:</h3>
        <ul>
          {iff.chunks.map((chunk, index) => (
            <li
              key={index}
              onClick={() => setSelectedChunk(chunk)}
              style={{
                cursor: "pointer",
                fontWeight: selectedChunk === chunk ? "bold" : "normal",
              }}
            >
              {chunk.id} - {chunk.size} bytes
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1">
        {selectedChunk && <ChunkViewer iff={iff} chunk={selectedChunk} />}
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
  ) : (
    <HexViewer chunk={chunk} />
  );
}

function BmhdViewer({ chunk }: { chunk: IffChunk<"BMHD"> }) {
  const { width, height, depth, compression } = decodeBmhd(chunk);

  return (
    <table>
      <tr>
        <td>Width</td>
        <td>{width}</td>
      </tr>
      <tr>
        <td>Height</td>
        <td>{height}</td>
      </tr>
      <tr>
        <td>Depth</td>
        <td>{depth}</td>
      </tr>
      <tr>
        <td>Compression</td>
        <td>{compression}</td>
      </tr>
    </table>
  );
}

function CmapViewer({ chunk }: { chunk: IffChunk<"CMAP"> }) {
  const colors = decodeCmap(chunk);

  return (
    <div>
      {colors.map((color, index) => (
        <div
          key={index}
          style={{
            width: "20px",
            height: "20px",
            backgroundColor: color,
            display: "inline-block",
          }}
        ></div>
      ))}
    </div>
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
    rows.push(<div key={i}>{rowValues.join(" ")}</div>);
  }

  return (
    <div>
      <h3>Chunk: {chunk.id}</h3>
      <pre>{rows}</pre>
    </div>
  );
}

function decodeBmhd(chunk: IffChunk<"BMHD">) {
  const dataView = new DataView(chunk.data);
  const width = dataView.getUint16(0, false);
  const height = dataView.getUint16(2, false);
  const depth = dataView.getUint8(8); // number of bitplanes

  const compression = dataView.getUint8(10); // 0 = none, 1 = RLE

  return { width, height, depth, compression };
}

function decodeCmap(chunk: IffChunk<"CMAP">): string[] {
  const dataView = new DataView(chunk.data);
  const numColors = chunk.size / 3;
  const colors: string[] = [];

  for (let i = 0; i < numColors; i++) {
    const r = dataView.getUint8(i * 3);
    const g = dataView.getUint8(i * 3 + 1);
    const b = dataView.getUint8(i * 3 + 2);
    colors.push(`rgb(${r}, ${g}, ${b})`);
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
    <div>
      <h3>Chunk: {chunk.id}</h3>
      {imageData.map((bitmap, index) => (
        <div key={index}>
          <h4>Bitplane {index}</h4>
          <BitmapCanvas bitmap={bitmap} width={cols * 8} />
        </div>
      ))}
    </div>
  );
}

function BitmapCanvas({
  bitmap,
  width,
}: {
  bitmap: Uint8ClampedArray;
  width: number;
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

  return <canvas ref={canvas} width={width} height={height} />;
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
