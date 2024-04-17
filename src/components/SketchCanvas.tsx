import { useRef, useState } from "react";
import {
  ReactSketchCanvas,
  type ReactSketchCanvasRef,
} from "react-sketch-canvas";

const SketchCanvas: React.FC = () => {
  const [strokeColor, setStrokeColor] = useState("#6497eb");
  const [strokeEraserWidth, setStrokeEraserWidth] = useState(4);
  const [eraseMode, setEraseMode] = useState(false);
  const canvasRef = useRef<ReactSketchCanvasRef>(null);

  const toggleEraseMode = () =>
    setEraseMode((prev) => {
      canvasRef.current?.eraseMode(!prev);
      return !prev;
    });

  const handleStrokeColorChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => setStrokeColor(event.target.value);

  const handleStrokeEraserWidthChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => setStrokeEraserWidth(+event.target.value);

  const handleUndo = () => canvasRef.current?.undo();
  const handleRedo = () => canvasRef.current?.redo();
  const handleClear = () => canvasRef.current?.clearCanvas();

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="flex flex-row gap-2">
        <input
          id="color-picker"
          type="color"
          value={strokeColor}
          onChange={handleStrokeColorChange}
        />
        <div className="w-0.5 bg-white rounded-full" />
        <button
          className="bg-white hover:bg-blue-200 text-blue-500 font-bold py-2 px-4 border border-blue-700 rounded disabled:opacity-50"
          disabled={!eraseMode}
          onClick={toggleEraseMode}
        >
          Pen
        </button>
        <button
          className="bg-white hover:bg-blue-200 text-blue-500 font-bold py-2 px-4 border border-blue-700 rounded disabled:opacity-50"
          disabled={eraseMode}
          onClick={toggleEraseMode}
        >
          Eraser
        </button>
        <div className="w-0.5 bg-white rounded-full" />
        <button
          className="bg-white hover:bg-blue-200 text-blue-500 font-bold py-2 px-4 border border-blue-700 rounded"
          onClick={handleUndo}
        >
          Undo
        </button>
        <button
          className="bg-white hover:bg-blue-200 text-blue-500 font-bold py-2 px-4 border border-blue-700 rounded"
          onClick={handleRedo}
        >
          Redo
        </button>
        <button
          className="bg-white hover:bg-blue-200 text-blue-500 font-bold py-2 px-4 border border-blue-700 rounded"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>
      <input
        type="range"
        min="1"
        max="20"
        step="1"
        className="cursor-pointer w-56"
        value={strokeEraserWidth}
        onChange={handleStrokeEraserWidthChange}
      />
      <ReactSketchCanvas
        id="canvas"
        ref={canvasRef}
        strokeColor={strokeColor}
        strokeWidth={strokeEraserWidth}
        eraserWidth={strokeEraserWidth}
      />
    </div>
  );
};

export default SketchCanvas;
