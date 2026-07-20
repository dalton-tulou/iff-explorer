import type { IffChunk } from "../../core/iff/IffChunk";
import type { IffFile } from "../../core/iff/IffFile";

export default function BodyViewer({
  chunk,
  file,
}: {
  chunk: IffChunk;
  file: IffFile;
}) {
  void chunk;
  void file;

  return (
    <div>
      <h3>BODY</h3>
      <p>TODO</p>
    </div>
  );
}
