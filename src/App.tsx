import React from "react";
import "./App.css";
import type { IffFile } from "./core/iff/IffFile";
import parseIff from "./core/iff/parseIff";
import type { FormatRegistry } from "./core/formats/FormatRegistry";
import IffViewer from "./core/iff/IffViewer";

function App({ registry }: { registry: FormatRegistry }) {
  const [iff, setIff] = React.useState<IffFile | null>(null);

  const plugin = React.useMemo(() => {
    if (!iff) {
      return undefined;
    }
    return registry.getPluginForType(iff.formType) || undefined;
  }, [iff, registry]);

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
              className="cursor-pointer text-blue-950 underline w-96 text-left"
            >
              Click here to select a file or drag and drop a file anywhere on
              the page
            </label>
          </div>
          <div className="w-full flex-1 flex flex-col items-center justify-center p-4">
            {iff ? <IffViewer iff={iff} plugin={plugin} /> : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
