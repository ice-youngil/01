import React, { useRef, useEffect, useState } from 'react';
import './SketchToolHome.css';

const CanvasComponent = ({ selectedTool, toolSize, eraserSize, image, onSaveHistory, selectedColor }) => { // eraserSize 추가
  const canvasRef = useRef(null); 
  const drawingCanvasRef = useRef(null); 
  const drawingContextRef = useRef(null); 
  const [isDrawing, setIsDrawing] = useState(false); 
  const [isPanning, setIsPanning] = useState(false); 
  const [startX, setStartX] = useState(0); 
  const [startY, setStartY] = useState(0); 
  const [offsetX, setOffsetX] = useState(0); 
  const [offsetY, setOffsetY] = useState(0); 
  const [scale, setScale] = useState(1); 

  useEffect(() => {
    const drawingCanvas = drawingCanvasRef.current;
    const drawingContext = drawingCanvas.getContext('2d');
    drawingContext.lineCap = 'round';
    drawingContextRef.current = drawingContext;

    const canvasContainer = document.querySelector('.canvas-container');

    if (image) {
      canvasContainer.style.position = 'relative';
      canvasContainer.style.overflow = 'hidden';
      canvasContainer.style.display = 'flex';
      canvasContainer.style.alignItems = 'center';
      canvasContainer.style.justifyContent = 'center';
    }

    canvasContainer.addEventListener('wheel', handleWheel);
    canvasContainer.addEventListener('mousedown', startPanning);
    canvasContainer.addEventListener('mousemove', pan);
    canvasContainer.addEventListener('mouseup', stopPanning);

    return () => {
      canvasContainer.removeEventListener('wheel', handleWheel);
      canvasContainer.removeEventListener('mousedown', startPanning);
      canvasContainer.removeEventListener('mousemove', pan);
      canvasContainer.removeEventListener('mouseup', stopPanning);
    };
  }, [scale, toolSize, offsetX, offsetY, selectedTool, image]);

  const handleWheel = (event) => {
    if (event.altKey) { 
      event.preventDefault();
      const newScale = Math.min(Math.max(0.5, scale + event.deltaY * -0.001), 3);
      setScale(newScale);
      const canvas = canvasRef.current;
      const drawingCanvas = drawingCanvasRef.current;
      canvas.style.transform = `scale(${newScale}) translate(${offsetX}px, ${offsetY}px)`;
      drawingCanvas.style.transform = `scale(${newScale}) translate(${offsetX}px, ${offsetY}px)`;
    }
  };

  const startPanning = (event) => {
    if (selectedTool === 'hand') {
      setIsPanning(true);
      setStartX(event.clientX - offsetX);
      setStartY(event.clientY - offsetY);
    }
  };

  const pan = (event) => {
    if (isPanning) {
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      setOffsetX(dx);
      setOffsetY(dy);
      const canvas = canvasRef.current;
      const drawingCanvas = drawingCanvasRef.current;
      canvas.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
      drawingCanvas.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
    }
  };

  const stopPanning = () => {
    setIsPanning(false);
  };

  const adjustCoordinates = (nativeEvent) => {
    const canvas = drawingCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      offsetX: (nativeEvent.clientX - rect.left) * (canvas.width / rect.width),
      offsetY: (nativeEvent.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = ({ nativeEvent }) => {
    if (selectedTool !== 'hand') {
      const { offsetX, offsetY } = adjustCoordinates(nativeEvent);
      drawingContextRef.current.beginPath();
      drawingContextRef.current.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    }
  };

  const finishDrawing = () => {
    if (selectedTool !== 'hand') {
      drawingContextRef.current.closePath();
      setIsDrawing(false);
      onSaveHistory(drawingCanvasRef.current);
    }
  };

  const draw = ({ nativeEvent }) => {
    if (isDrawing && selectedTool !== 'hand') {
      const { offsetX, offsetY } = adjustCoordinates(nativeEvent);
      drawingContextRef.current.lineTo(offsetX, offsetY);
      drawingContextRef.current.stroke();
    }
  };

  useEffect(() => {
    if (selectedTool === 'eraser') {
      drawingContextRef.current.globalCompositeOperation = 'destination-out';
      drawingContextRef.current.lineWidth = eraserSize; // 지우개 크기 적용
    } else if (selectedTool === 'pen') {
      drawingContextRef.current.globalCompositeOperation = 'source-over';
      drawingContextRef.current.strokeStyle = selectedColor; // 펜 색상 적용
      drawingContextRef.current.lineWidth = toolSize; // 펜 크기 적용
    }
  }, [selectedTool, toolSize, eraserSize, selectedColor]);

  useEffect(() => {
    if (image) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const img = new Image();
      img.src = image;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);

        const drawingCanvas = drawingCanvasRef.current;
        drawingCanvas.width = img.width;
        drawingCanvas.height = img.height;
      };
    }
  }, [image]);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} className={image ? 'active-canvas' : 'inactive-canvas'} />
      <canvas
        ref={drawingCanvasRef}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        className={image ? 'active-canvas' : 'inactive-canvas'}
      />
      {!image && <div className="placeholder">이미지를 불러와 주세요</div>}
    </div>
  );
};

export default CanvasComponent;
