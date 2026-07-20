import type { IffChunk } from "../../core/iff/IffChunk";

export default function TextViewer({ chunk }: { chunk: IffChunk }) {
  const text = new TextDecoder().decode(chunk.data);
  return (
    <div>
      <h3>Text</h3>
      <pre>{text}</pre>
    </div>
  );
}
