"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import {
  Viewer,
  Worker,
  ScrollMode,
  PageChangeEvent,
} from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Toaster, toast } from "react-hot-toast";
import { Stage, Layer, Rect, Text, Line } from "react-konva";
import {
  Upload,
  PenTool,
  Highlighter,
  Type,
  Download,
  ChevronLeft,
  ChevronRight,
  Signature as SignatureIcon,
  Bold,
  Italic,
  Underline,
  Circle,
  X,
  Undo,
} from "lucide-react";
import { ChromePicker } from "react-color";

// Comprehensive Annotation Types
interface BaseAnnotation {
  id: string;
  type: "highlight" | "text" | "draw" | "signature";
  color?: string;
  page: number;
}

interface HighlightAnnotation extends BaseAnnotation {
  type: "highlight";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface TextAnnotation extends BaseAnnotation {
  type: "text";
  x: number;
  y: number;
  text: string;
  color?: string;
  fontSize?: number;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
}

interface DrawAnnotation extends BaseAnnotation {
  type: "draw";
  points: number[];
  color?: string;
}

interface SignatureAnnotation extends BaseAnnotation {
  type: "signature";
  x: number;
  y: number;
  points: number[];
}

type Annotation =
  | HighlightAnnotation
  | TextAnnotation
  | DrawAnnotation
  | SignatureAnnotation;

const PDFAnnotator: React.FC<{
  document: File;
  onDocumentChange: (file: File) => void;
  onUploadNew: () => void; // New prop
}> = ({ document, onDocumentChange, onUploadNew }) => {
  // State Management
  const [mode, setMode] = useState<"draw" | "highlight" | "text" | "signature">(
    "draw"
  );
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentAnnotation, setCurrentAnnotation] =
    useState<Partial<Annotation> | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Color States with Color Picker
  const [isHighlightColorPickerOpen, setIsHighlightColorPickerOpen] =
    useState(false);
  const [isDrawColorPickerOpen, setIsDrawColorPickerOpen] = useState(false);
  const [isTextColorPickerOpen, setIsTextColorPickerOpen] = useState(false);
  const [highlightColor, setHighlightColor] = useState<string>("#FFFF00");
  const [drawColor, setDrawColor] = useState<string>("#000000");
  const [textColor, setTextColor] = useState<string>("#000000");

  // Text Formatting States
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  // Refs
  const stageRef = useRef<any>(null);
  const viewerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const highlightColorPickerRef = useRef<any>(null);
  const drawColorPickerRef = useRef<any>(null);
  const textColorPickerRef = useRef<any>(null);

  // Color Palette
  const colorPalette = [
    "#FFFF00", // Yellow
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#A8DADC", // Light Blue
    "#9C6644", // Brown
  ];

  // Font Sizes
  const fontSizes = [12, 16, 20, 24, 32];

  // Effect to handle clicks outside color pickers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Highlight Color Picker
      if (
        highlightColorPickerRef.current &&
        !highlightColorPickerRef.current.contains(event.target as Node)
      ) {
        setIsHighlightColorPickerOpen(false);
      }

      // Draw Color Picker
      if (
        drawColorPickerRef.current &&
        !drawColorPickerRef.current.contains(event.target as Node)
      ) {
        setIsDrawColorPickerOpen(false);
      }

      // Text Color Picker
      if (
        textColorPickerRef.current &&
        !textColorPickerRef.current.contains(event.target as Node)
      ) {
        setIsTextColorPickerOpen(false);
      }
    };

    window.document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load PDF URL
  useEffect(() => {
    const url = URL.createObjectURL(document);
    setPdfUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [document]);

  // Load PDF for Modification
  useEffect(() => {
    const loadPdfDocument = async () => {
      try {
        const arrayBuffer = await document.arrayBuffer();
        const loadedPdfDoc = await PDFDocument.load(arrayBuffer);
        setPdfDoc(loadedPdfDoc);
      } catch (error) {
        console.error("Error loading PDF document", error);
        toast.error("Could not load PDF document");
      }
    };
    loadPdfDocument();
  }, [document]);

  // Page Change Handler
  const handlePageChange = useCallback((e: PageChangeEvent) => {
    setCurrentPage(e.currentPage);
  }, []);

  // Undo Functionality
  const handleUndo = () => {
    setAnnotations((prev) => {
      const newAnnotations = [...prev];
      newAnnotations.pop();
      return newAnnotations;
    });
  };

  // Mouse Event Handlers
  const handleMouseDown = (e: any) => {
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!stage || !point) return;

    switch (mode) {
      case "draw":
        setCurrentAnnotation({
          id: `draw-${Date.now()}`,
          type: "draw",
          points: [point.x, point.y],
          color: drawColor,
          page: currentPage,
        });
        break;
      case "highlight":
        setCurrentAnnotation({
          id: `highlight-${Date.now()}`,
          type: "highlight",
          x: point.x,
          y: point.y,
          width: 0,
          height: 0,
          color: highlightColor,
          page: currentPage,
        });
        break;
      case "text":
        if (textInputRef.current) {
          textInputRef.current.style.left = `${point.x}px`;
          textInputRef.current.style.top = `${point.y}px`;
          textInputRef.current.value = "";
          textInputRef.current.style.display = "block";
          textInputRef.current.focus();
        }
        break;
      case "signature":
        setCurrentAnnotation({
          id: `signature-${Date.now()}`,
          type: "signature",
          x: point.x,
          y: point.y,
          points: [point.x, point.y],
          page: currentPage,
        });
        break;
    }
  };

  const handleMouseMove = (e: any) => {
    if (!currentAnnotation) return;
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!stage || !point) return;

    switch (currentAnnotation.type) {
      case "draw":
        setCurrentAnnotation((prev: any) => ({
          ...prev,
          points: [...(prev?.points || []), point.x, point.y],
        }));
        break;
      case "highlight":
        setCurrentAnnotation((prev: any) => ({
          ...prev,
          width: point.x - (prev?.x || 0),
          height: point.y - (prev?.y || 0),
        }));
        break;
      case "signature":
        setCurrentAnnotation((prev: any) => ({
          ...prev,
          points: [...(prev?.points || []), point.x, point.y],
        }));
        break;
    }
  };

  const handleMouseUp = () => {
    if (currentAnnotation) {
      const shouldSave =
        (currentAnnotation.type === "draw" &&
          currentAnnotation.points &&
          currentAnnotation.points.length > 2) ||
        (currentAnnotation.type === "highlight" &&
          currentAnnotation.width &&
          currentAnnotation.width !== 0) ||
        (currentAnnotation.type === "signature" &&
          currentAnnotation.points &&
          currentAnnotation.points.length > 2);

      if (shouldSave) {
        setAnnotations((prev) => [...prev, currentAnnotation as Annotation]);
      }
      setCurrentAnnotation(null);
    }
  };

  // Text Input Handler
  const handleTextInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && textInputRef.current) {
      const text = textInputRef.current.value;
      const x = parseFloat(textInputRef.current.style.left);
      const y = parseFloat(textInputRef.current.style.top);

      if (text.trim()) {
        setAnnotations((prev) => [
          ...prev,
          {
            id: `text-${Date.now()}`,
            type: "text",
            x,
            y,
            text,
            color: textColor,
            fontSize,
            isBold,
            isItalic,
            isUnderline,
            page: currentPage,
          },
        ]);

        // Reset text formatting
        setIsBold(false);
        setIsItalic(false);
        setIsUnderline(false);
        setFontSize(16);
      }

      textInputRef.current.value = "";
      textInputRef.current.style.display = "none";
    }
  };

  // PDF Export with Annotations

  const exportAnnotatedPDF = async () => {
    if (!pdfDoc) {
      toast.error("No PDF document loaded");
      return;
    }

    try {
      const pages = pdfDoc.getPages();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBoldFont = await pdfDoc.embedFont(
        StandardFonts.HelveticaBold
      );

      // Function to calculate accurate page coordinates
      const calculatePageCoordinates = (
        x: number,
        y: number,
        pageHeight: number
      ) => {
        const xOffset = -80; // Horizontal adjustment
        const yOffset = 0; // Vertical adjustment
        return {
          x: x + xOffset,
          y: pageHeight - y - yOffset,
        };
      };

      const calculatePageCoordinatesForText = (
        x: number,
        y: number,
        pageHeight: number
      ) => {
        const xOffset = -80; // Horizontal adjustment
        const yOffset = 12; // Vertical adjustment to account for 

        return {
          x: x + xOffset,
          y: pageHeight - y - yOffset,
        };
      };

      // Add annotations to PDF
      for (const annotation of annotations) {
        const page = pages[annotation.page];
        const pageHeight = page.getHeight();

        switch (annotation.type) {
          case "highlight":
            const highlightAnnotation = annotation as HighlightAnnotation;
            const highlightCoords = calculatePageCoordinates(
              highlightAnnotation.x,
              highlightAnnotation.y,
              pageHeight
            );

            page.drawRectangle({
              x: highlightCoords.x,
              y: highlightCoords.y - highlightAnnotation.height,
              width: highlightAnnotation.width,
              height: highlightAnnotation.height,
              color: rgb(
                parseInt(highlightAnnotation.color.slice(1, 3), 16) / 255,
                parseInt(highlightAnnotation.color.slice(3, 5), 16) / 255,
                parseInt(highlightAnnotation.color.slice(5, 7), 16) / 255
              ),
              opacity: 0.5,
            });
            break;
          case "text":
            const textAnnotation = annotation as TextAnnotation;
            const font = textAnnotation.isBold
              ? helveticaBoldFont
              : helveticaFont;

            // Convert hex color to RGB
            const textRGB = textAnnotation.color
              ? rgb(
                  parseInt(textAnnotation.color.slice(1, 3), 16) / 255,
                  parseInt(textAnnotation.color.slice(3, 5), 16) / 255,
                  parseInt(textAnnotation.color.slice(5, 7), 16) / 255
                )
              : rgb(0, 0, 0);

            const textCoords = calculatePageCoordinatesForText(
              textAnnotation.x,
              textAnnotation.y,
              pageHeight
            );

            page.drawText(textAnnotation.text, {
              x: textCoords.x,
              y: textCoords.y,
              size: textAnnotation.fontSize || 12,
              font,
              color: textRGB,
            });
            break;
          case "draw":
          case "signature":
            const drawAnnotation = annotation as
              | DrawAnnotation
              | SignatureAnnotation;

            // Validate and process points
            if (drawAnnotation.points && drawAnnotation.points.length > 2) {
              // Create lines connecting the points
              for (let i = 0; i < drawAnnotation.points.length - 2; i += 2) {
                const x1 = drawAnnotation.points[i];
                const y1 = drawAnnotation.points[i + 1];
                const x2 = drawAnnotation.points[i + 2];
                const y2 = drawAnnotation.points[i + 3];

                const start = calculatePageCoordinates(x1, y1, pageHeight);
                const end = calculatePageCoordinates(x2, y2, pageHeight);

                // Convert to PDF coordinate system
                page.drawLine({
                  start: {
                    x: start.x,
                    y: start.y,
                  },
                  end: {
                    x: end.x,
                    y: end.y,
                  },
                  thickness: 2,
                  color: drawAnnotation.color
                    ? rgb(
                        parseInt(drawAnnotation.color.slice(1, 3), 16) / 255,
                        parseInt(drawAnnotation.color.slice(3, 5), 16) / 255,
                        parseInt(drawAnnotation.color.slice(5, 7), 16) / 255
                      )
                    : rgb(0, 0, 0),
                });
              }
            }
            break;
        }
      }

      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.save();
      const modifiedPdfFile = new File([modifiedPdfBytes], "annotated.pdf", {
        type: "application/pdf",
      });

      // Trigger download
      const link = window.document.createElement("a");
      link.href = URL.createObjectURL(modifiedPdfFile);
      link.download = "annotated.pdf";
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      toast.success("PDF Exported Successfully");

      onUploadNew();
    } catch (error) {
      toast.error("Export Failed");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
          <div className="md:col-span-9 bg-gray-100 rounded-xl overflow-hidden relative h-[950px] w-full scroll-auto">
            {pdfUrl ? (
              <>
                <div className="absolute w-full h-full z-0 overflow-auto">
                  <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                    <Viewer
                      ref={viewerRef}
                      fileUrl={pdfUrl}
                      defaultScale={1}
                      scrollMode={ScrollMode.Page}
                      initialPage={currentPage}
                      onDocumentLoad={(e) => {
                        setNumPages(e.doc.numPages);
                        setCurrentPage(0);
                      }}
                      onPageChange={handlePageChange}
                    />
                  </Worker>
                </div>

                <Stage
                  width={window.innerWidth}
                  height={window.innerHeight}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  ref={stageRef}
                  className="absolute w-full h-full z-10"
                >
                  <Layer>
                    {annotations
                      .filter((a) => a.page === currentPage)
                      .map((annotation) => {
                        switch (annotation.type) {
                          case "highlight":
                            const highlightAnnotation =
                              annotation as HighlightAnnotation;
                            return (
                              <Rect
                                key={annotation.id}
                                x={highlightAnnotation.x}
                                y={highlightAnnotation.y}
                                width={highlightAnnotation.width}
                                height={highlightAnnotation.height}
                                fill={highlightAnnotation.color}
                                opacity={0.5}
                              />
                            );
                          case "text":
                            const textAnnotation = annotation as TextAnnotation;
                            return (
                              <Text
                                key={annotation.id}
                                x={textAnnotation.x}
                                y={textAnnotation.y}
                                text={textAnnotation.text}
                                fontSize={textAnnotation.fontSize || 16}
                                fill={textAnnotation.color || "#000000"}
                                fontStyle={
                                  (textAnnotation.isBold ? "bold " : "") +
                                  (textAnnotation.isItalic ? "italic " : "")
                                }
                                textDecoration={
                                  textAnnotation.isUnderline
                                    ? "underline"
                                    : "none"
                                }
                                draggable
                              />
                            );
                          case "draw":
                            const drawAnnotation = annotation as DrawAnnotation;
                            return (
                              <Line
                                key={annotation.id}
                                points={drawAnnotation.points}
                                stroke={drawAnnotation.color || "#000000"}
                                strokeWidth={2}
                                tension={0.5}
                                lineCap="round"
                                lineJoin="round"
                              />
                            );
                          case "signature":
                            const signatureAnnotation =
                              annotation as SignatureAnnotation;
                            return (
                              <Line
                                key={annotation.id}
                                points={signatureAnnotation.points}
                                stroke="#000000"
                                strokeWidth={2}
                                tension={0.5}
                                lineCap="round"
                                lineJoin="round"
                              />
                            );
                        }
                      })}

                    {/* Current Drawing Annotation */}
                    {currentAnnotation?.type === "draw" && (
                      <Line
                        points={currentAnnotation.points || []}
                        stroke={currentAnnotation.color || "#000000"}
                        strokeWidth={2}
                        tension={0.5}
                        lineCap="round"
                        lineJoin="round"
                      />
                    )}
                    {currentAnnotation?.type === "highlight" && (
                      <Rect
                        x={currentAnnotation.x || 0}
                        y={currentAnnotation.y || 0}
                        width={currentAnnotation.width || 0}
                        height={currentAnnotation.height || 0}
                        fill={currentAnnotation.color || "#FFFF00"}
                        opacity={0.5}
                      />
                    )}
                  </Layer>
                </Stage>

                {/* Text Input */}
                <input
                  ref={textInputRef}
                  type="text"
                  placeholder="Enter text"
                  className="absolute z-50 bg-white p-2 text-black border rounded"
                  style={{ display: "none" }}
                  onKeyDown={handleTextInput}
                />
              </>
            ) : (
              <div
                className="flex flex-col items-center justify-center h-full text-center p-6 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={64} className="text-gray-400 mb-4" />
                <p className="text-xl text-gray-600">
                  Drag and Drop PDF or Click to Upload
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onDocumentChange(file);
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Sidebar Controls */}
          <div className="md:col-span-3 space-y-4">
            {/* Page Navigation */}
            <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
              <button
                onClick={() => viewerRef.current?.jumpToPage(currentPage - 1)}
                disabled={currentPage <= 0}
                className="p-2 hover:bg-gray-200 rounded-md disabled:opacity-50"
              >
                <ChevronLeft />
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage + 1} of {numPages}
              </span>
              <button
                onClick={() => viewerRef.current?.jumpToPage(currentPage + 1)}
                disabled={currentPage >= numPages - 1}
                className="p-2 hover:bg-gray-200 rounded-md disabled:opacity-50"
              >
                <ChevronRight />
              </button>
            </div>

            {/* Annotation Mode Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {["draw", "highlight", "text", "signature"].map(
                (annotationType) => (
                  <button
                    key={annotationType}
                    onClick={() => setMode(annotationType as any)}
                    className={`
                    flex flex-col items-center justify-center 
                    py-3 rounded-lg transition-all duration-200
                    ${
                      mode === annotationType
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
                  `}
                  >
                    {annotationType === "draw" && <PenTool />}
                    {annotationType === "highlight" && <Highlighter />}
                    {annotationType === "text" && <Type />}
                    {annotationType === "signature" && <SignatureIcon />}
                    <span className="text-xs mt-1 capitalize">
                      {annotationType}
                    </span>
                  </button>
                )
              )}
            </div>

            {/* Color and Text Formatting Selectors */}
            <div className="space-y-2">
              {mode === "highlight" && (
                <div className="relative">
                  <div className="flex space-x-2">
                    {colorPalette.map((color) => (
                      <button
                        key={color}
                        onClick={() => setHighlightColor(color)}
                        className="w-8 h-8 rounded-full"
                        style={{
                          backgroundColor: color,
                          border:
                            highlightColor === color
                              ? "2px solid black"
                              : "none",
                        }}
                      />
                    ))}
                    <button
                      onClick={() =>
                        setIsHighlightColorPickerOpen(
                          !isHighlightColorPickerOpen
                        )
                      }
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                    >
                      <Circle size={16} />
                    </button>
                  </div>
                  {isHighlightColorPickerOpen && (
                    <div
                      ref={highlightColorPickerRef}
                      className="absolute z-50 mt-2"
                    >
                      <ChromePicker
                        color={highlightColor}
                        onChange={(color: any) => setHighlightColor(color.hex)}
                      />
                    </div>
                  )}
                </div>
              )}

              {(mode === "draw" || mode === "signature") && (
                <div className="relative">
                  <div className="flex space-x-2">
                    {colorPalette.map((color) => (
                      <button
                        key={color}
                        onClick={() => setDrawColor(color)}
                        className="w-8 h-8 rounded-full"
                        style={{
                          backgroundColor: color,
                          border:
                            drawColor === color ? "2px solid black" : "none",
                        }}
                      />
                    ))}
                    <button
                      onClick={() =>
                        setIsDrawColorPickerOpen(!isDrawColorPickerOpen)
                      }
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                    >
                      <Circle size={16} />
                    </button>
                  </div>
                  {isDrawColorPickerOpen && (
                    <div
                      ref={drawColorPickerRef}
                      className="absolute z-50 mt-2"
                    >
                      <ChromePicker
                        color={drawColor}
                        onChange={(color: any) => setDrawColor(color.hex)}
                      />
                    </div>
                  )}
                </div>
              )}

              {mode === "text" && (
                <>
                  {/* Color Selector */}
                  <div className="relative">
                    <div className="flex space-x-2 mb-2">
                      {colorPalette.map((color) => (
                        <button
                          key={color}
                          onClick={() => setTextColor(color)}
                          className="w-8 h-8 rounded-full"
                          style={{
                            backgroundColor: color,
                            border:
                              textColor === color ? "2px solid black" : "none",
                          }}
                        />
                      ))}
                      <button
                        onClick={() =>
                          setIsTextColorPickerOpen(!isTextColorPickerOpen)
                        }
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                      >
                        <Circle size={16} />
                      </button>
                    </div>
                    {isTextColorPickerOpen && (
                      <div
                        ref={textColorPickerRef}
                        className="absolute z-50 mt-2"
                      >
                        <ChromePicker
                          color={textColor}
                          onChange={(color: any) => setTextColor(color.hex)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Text Formatting Options */}
                  <div className="flex space-x-2 mb-2">
                    <button
                      onClick={() => setIsBold(!isBold)}
                      className={`p-2 rounded ${
                        isBold ? "bg-blue-500 text-white" : "bg-gray-200"
                      }`}
                    >
                      <Bold size={16} />
                    </button>
                    <button
                      onClick={() => setIsItalic(!isItalic)}
                      className={`p-2 rounded ${
                        isItalic ? "bg-blue-500 text-white" : "bg-gray-200"
                      }`}
                    >
                      <Italic size={16} />
                    </button>
                    <button
                      onClick={() => setIsUnderline(!isUnderline)}
                      className={`p-2 rounded ${
                        isUnderline ? "bg-blue-500 text-white" : "bg-gray-200"
                      }`}
                    >
                      <Underline size={16} />
                    </button>
                  </div>

                  {/* Font Size Selector */}
                  <div className="flex space-x-2">
                    {fontSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`
                          px-2 py-1 rounded 
                          ${
                            fontSize === size
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200"
                          }
                        `}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleUndo}
                className="
                  flex items-center justify-center 
                  bg-red-500 text-white py-2 rounded-lg 
                  hover:bg-red-600 active:scale-95 transition-all
                  text-sm sm:text-base
                "
              >
                <Undo className="mr-1 sm:mr-2" size={16} />
                <span className="hidden sm:inline">Undo</span>
              </button>

              <button
                onClick={exportAnnotatedPDF}
                className="
                  flex items-center justify-center 
                  bg-green-500 text-white py-2 rounded-lg 
                  hover:bg-green-600 active:scale-95 transition-all
                  text-sm sm:text-base
                "
              >
                <Download className="mr-1 sm:mr-2" size={16} />
                <span className="hidden sm:inline">Export</span>
              </button>

              <button
                onClick={onUploadNew}
                className="
                  flex items-center justify-center 
                  bg-blue-500 text-white py-2 rounded-lg 
                  hover:bg-blue-600 active:scale-95 transition-all
                  text-sm sm:text-base
                "
              >
                <X className="mr-1 sm:mr-2" size={16} />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
    </div>
  );
};

export default PDFAnnotator;
