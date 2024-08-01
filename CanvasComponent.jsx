import React, { useRef, useEffect, useState } from 'react';
import './SketchToolHome.css';

const CanvasComponent = ({ selectedTool, toolSize, image, onSaveHistory }) => {
  const canvasRef = useRef(null); // 이미지 캔버스 참조
  const drawingCanvasRef = useRef(null); // 그리기 캔버스 참조
  const drawingContextRef = useRef(null); // 그리기 캔버스의 2D 컨텍스트 참조
  const [isDrawing, setIsDrawing] = useState(false); // 그리기 중 여부 상태
  const [isPanning, setIsPanning] = useState(false); // 패닝 중 여부 상태
  const [startX, setStartX] = useState(0); // 패닝 시작 X 좌표
  const [startY, setStartY] = useState(0); // 패닝 시작 Y 좌표
  const [offsetX, setOffsetX] = useState(0); // 캔버스 X 이동 거리
  const [offsetY, setOffsetY] = useState(0); // 캔버스 Y 이동 거리
  const [scale, setScale] = useState(1); // 캔버스 스케일 상태

  useEffect(() => {
    const drawingCanvas = drawingCanvasRef.current;
    const drawingContext = drawingCanvas.getContext('2d');
    drawingContext.lineCap = 'round';
    drawingContext.lineWidth = toolSize;
    drawingContextRef.current = drawingContext;

    // 이벤트 리스너를 캔버스 컨테이너에 연결
    const canvasContainer = document.querySelector('.canvas-container');

    // 캔버스 컨테이너의 스타일을 이미지 업로드 후에도 유지
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

  // 캔버스 줌 핸들러
  const handleWheel = (event) => {
    if (event.altKey) { // Alt 키가 눌려 있을 때만 줌 기능 활성화
      event.preventDefault();
      const newScale = Math.min(Math.max(0.5, scale + event.deltaY * -0.001), 3);
      setScale(newScale);
      const canvas = canvasRef.current;
      const drawingCanvas = drawingCanvasRef.current;
      // 줌과 패닝을 동시에 적용
      canvas.style.transform = `scale(${newScale}) translate(${offsetX}px, ${offsetY}px)`;
      drawingCanvas.style.transform = `scale(${newScale}) translate(${offsetX}px, ${offsetY}px)`;
    }
  };

  // 패닝 시작 핸들러
  const startPanning = (event) => {
    if (selectedTool === 'hand') {
      setIsPanning(true);
      setStartX(event.clientX - offsetX);
      setStartY(event.clientY - offsetY);
    }
  };

  // 패닝 중 핸들러
  const pan = (event) => {
    if (isPanning) {
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      setOffsetX(dx);
      setOffsetY(dy);
      const canvas = canvasRef.current;
      const drawingCanvas = drawingCanvasRef.current;
      // 패닝 동작 적용
      canvas.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
      drawingCanvas.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
    }
  };

  // 패닝 종료 핸들러
  const stopPanning = () => {
    setIsPanning(false);
  };

  // 마우스 이벤트 좌표를 캔버스의 크기와 위치에 맞게 조정
  const adjustCoordinates = (nativeEvent) => {
    const canvas = drawingCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      offsetX: (nativeEvent.clientX - rect.left) * (canvas.width / rect.width),
      offsetY: (nativeEvent.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  // 그리기 시작 핸들러
  const startDrawing = ({ nativeEvent }) => {
    if (selectedTool !== 'hand') {
      const { offsetX, offsetY } = adjustCoordinates(nativeEvent);
      drawingContextRef.current.beginPath();
      drawingContextRef.current.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    }
  };

  // 그리기 종료 핸들러
  const finishDrawing = () => {
    if (selectedTool !== 'hand') {
      drawingContextRef.current.closePath();
      setIsDrawing(false);
      onSaveHistory(drawingCanvasRef.current); // 그리기 종료 후 히스토리에 저장
    }
  };

  // 그리기 중 핸들러
  const draw = ({ nativeEvent }) => {
    if (isDrawing && selectedTool !== 'hand') {
      const { offsetX, offsetY } = adjustCoordinates(nativeEvent);
      drawingContextRef.current.lineTo(offsetX, offsetY);
      drawingContextRef.current.stroke();
    }
  };

  // 도구 변경 시 컨텍스트 업데이트
  useEffect(() => {
    if (selectedTool === 'eraser') {
      drawingContextRef.current.globalCompositeOperation = 'destination-out'; // 지우개 모드
      drawingContextRef.current.lineWidth = toolSize * 2; // 지우개 크기 설정
    } else if (selectedTool === 'pen') {
      drawingContextRef.current.globalCompositeOperation = 'source-over'; // 일반 펜 모드
      drawingContextRef.current.strokeStyle = 'black'; // 펜 색상 설정
      drawingContextRef.current.lineWidth = toolSize; // 펜 크기 설정
    }
  }, [selectedTool, toolSize]);

  useEffect(() => {
    if (image) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const img = new Image();
      img.src = image;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        context.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 초기화
        context.drawImage(img, 0, 0, canvas.width, canvas.height); // 이미지 그리기

        // 그리기 캔버스 크기 조정
        const drawingCanvas = drawingCanvasRef.current;
        drawingCanvas.width = img.width;
        drawingCanvas.height = img.height;
      };
    }
  }, [image]);

  return (
    <div className="canvas-container">
      {/* 이미지 캔버스 */}
      <canvas ref={canvasRef} className={image ? 'active-canvas' : 'inactive-canvas'} />
      {/* 그리기 캔버스 */}
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
