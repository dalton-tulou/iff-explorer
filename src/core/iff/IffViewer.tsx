import React from "react";
import type { IffFile } from "./IffFile";
import type { IffChunk } from "./IffChunk";
import type { FormatPlugin } from "../formats/FormatPlugin";
import HexViewer from "./HexViewer";

export default function IffViewer({
  iff,
  plugin,
}: {
  iff: IffFile;
  plugin?: FormatPlugin;
}) {
  const [selectedChunk, setSelectedChunk] = React.useState<
    IffChunk | undefined
  >(undefined);

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
              setSelectedChunk(
                iff.chunks[parseInt(e.target.value)] || undefined,
              )
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
        <div className="flex-1 p-4 bg-slate-100 flex flex-col gap-4">
          {plugin ? (
            selectedChunk ? (
              React.createElement(
                plugin.chunkViewers[selectedChunk.id] ?? HexViewer,
                { file: iff, chunk: selectedChunk },
              )
            ) : plugin.fileViewer ? (
              <plugin.fileViewer file={iff} />
            ) : (
              <p>Unsupported file type: {iff.formType}</p>
            )
          ) : selectedChunk ? (
            <HexViewer chunk={selectedChunk} />
          ) : (
            <p>Unsupported file type: {iff.formType}</p>
          )}
        </div>
      </div>
    </div>
  );
}
