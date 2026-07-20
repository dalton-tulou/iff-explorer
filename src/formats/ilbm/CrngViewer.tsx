import type { IffChunk } from "../../core/iff/IffChunk";
import type { IffFile } from "../../core/iff/IffFile";

export default function CrngViewer({
  chunk,
}: {
  chunk: IffChunk;
  file: IffFile;
}) {
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
