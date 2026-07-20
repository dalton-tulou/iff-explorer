import type { IffChunk } from "../../core/iff/IffChunk";
import type { IffFile } from "../../core/iff/IffFile";
import decodeVhdr from "./decodeVhdr";
import { useMemo } from "react";

export default function VhdrViewer({
  chunk,
}: {
  file: IffFile;
  chunk: IffChunk;
}) {
  const props = useMemo(() => decodeVhdr(chunk), [chunk]);
  return (
    <div>
      <h3>Voice 8 Header</h3>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  );
}
