import React from "react";

export default function DropZone(props: {
  onFileUpload: (file: File) => void;
  acceptedMimeTypes?: string[];
}) {
  // a button to upload a file or drag and drop a file
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      props.onFileUpload(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      props.onFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-2 border-dashed border-gray-400 p-4 text-center cursor-pointer w-full flex-1"
    >
      <p>Drag and drop a file here, or click to select a file</p>
      <input
        type="file"
        accept={props.acceptedMimeTypes?.join(",")}
        onChange={handleFileUpload}
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
  );
}
