import type { IffChunk } from "./IffChunk";

export type IffFile = {
  filename: string;
  id: "FORM";
  size: number;
  formType: string;
  chunks: IffChunk[];
};
