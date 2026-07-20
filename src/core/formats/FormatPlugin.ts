import React from "react";
import type { IffFile } from "../iff/IffFile";
import type { IffChunk } from "../iff/IffChunk";

export interface FormatPlugin {
  name: string;
  supportedTypes: string[];

  fileViewer?: React.ComponentType<{ file: IffFile }>;
  chunkViewers: Record<
    string,
    React.ComponentType<{ file: IffFile; chunk: IffChunk }>
  >;
}
