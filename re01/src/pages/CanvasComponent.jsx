import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import './SketchToolHome.css';

const CanvasComponent = forwardRef(({ selectedTool, toolSize, eraserSize, image, onSaveHistory, selectedColor }, ref) => {
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
  const [textBoxes, setTextBoxes] = useState([]);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingIndex, setResizingIndex] = useState(null);
  const [rotatingIndex, setRotatingIndex] = useState(null);
  const [rotation, setRotation] = useState(0);

  useImperativeHandle(ref, () => ({
    getMergedImage: () => {
      const canvas = canvasRef.current;
      const drawingCanvas = drawingCanvasRef.current;
      const mergedCanvas = document.createElement('canvas');
      const mergedContext = mergedCanvas.getContext('2d');

      mergedCanvas.width = canvas.width;
      mergedCanvas.height = canvas.height;

      mergedContext.drawImage(canvas, 0, 0);
      mergedContext.drawImage(drawingCanvas, 0, 0);

      textBoxes.forEach(textBox => {
        mergedContext.save();
        mergedContext.translate(
          textBox.position.left * canvas.width + textBox.width / 2,
          textBox.position.top * canvas.height + textBox.height / 2
        );
        mergedContext.rotate((textBox.rotation || 0) * Math.PI / 180);
        mergedContext.translate(-textBox.width / 2, -textBox.height / 2);
        mergedContext.font = `${textBox.fontSize * scale}vh ${textBox.fontFamily}`;
        mergedContext.fillStyle = textBox.color;
        mergedContext.fillText(textBox.text, 0, textBox.height / 2);
        mergedContext.restore();
      });

      return mergedCanvas.toDataURL('image/png');
    },
    clearCanvas: () => {
      const drawingCanvas = drawingCanvasRef.current;
      const drawingContext = drawingContextRef.current;
      drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
    },
    addText: (textSettings) => {
      const { text, fontSize, color, fontFamily, position } = textSettings;
      const newTextBox = {
        text,
        fontSize,
        color,
        fontFamily,
        position,
        width: 100, // 초기 너비
        height: 30, // 초기 높이
        rotation: 0 // 초기 회전 각도
      };
      setTextBoxes((prevTextBoxes) => [...prevTextBoxes, newTextBox]);
    },
    addEmoji: (emojiSettings) => {
      const { emoji, size, position } = emojiSettings;
      const newEmoji = {
        emoji,
        size,
        position,
        width: 50, // 초기 너비
        height: 50, // 초기 높이
        rotation: 0 // 초기 회전 각도
      };
      setTextBoxes((prevTextBoxes) => [...prevTextBoxes, newEmoji]);
    }
  }));

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
  }, [image]);

  useEffect(() => {
    const drawingContext = drawingContextRef.current;

    if (selectedTool === 'pen') {
      drawingContext.globalCompositeOperation = 'source-over';
      drawingContext.lineWidth = toolSize;
      drawingContext.strokeStyle = selectedColor;
    } else if (selectedTool === 'eraser') {
      drawingContext.globalCompositeOperation = 'destination-out';
      drawingContext.lineWidth = eraserSize;
    }
  }, [toolSize, selectedColor, eraserSize, selectedTool]);

  const handleWheel = (event) => {
    if (event.altKey) {
      event.preventDefault();
      const newScale = Math.min(Math.max(0.5, scale + event.deltaY * -0.001), 3);
      setScale(newScale);
      const canvas = canvasRef.current;
      const drawingCanvas = drawingCanvasRef.current;
      canvas.style.transform = `scale(${newScale}) translate(${offsetX}px, ${offsetY}px)`;
      drawingCanvas.style.transform = `scale(${newScale}) translate(${offsetX}px, ${offsetY}px)`;

      // 텍스트 박스 위치와 크기 조정
      setTextBoxes(prevTextBoxes => 
        prevTextBoxes.map(textBox => ({
          ...textBox,
          position: {
            left: textBox.position.left,
            top: textBox.position.top
          }
        }))
      );
    }
  };

  const startPanning = (event) => {
    if (selectedTool === 'hand') {
      setIsPanning(true);
      setStartX(event.clientX);
      setStartY(event.clientY);
    }
  };

  const pan = (event) => {
    if (isPanning) {
      const dx = (event.clientX - startX) * 1.2;
      const dy = (event.clientY - startY) * 1.2;
      setOffsetX((prevOffsetX) => prevOffsetX + dx);
      setOffsetY((prevOffsetY) => prevOffsetY + dy);
      const canvas = canvasRef.current;
      const drawingCanvas = drawingCanvasRef.current;
      canvas.style.transform = `scale(${scale}) translate(${offsetX + dx}px, ${offsetY + dy}px)`;
      drawingCanvas.style.transform = `scale(${scale}) translate(${offsetX + dx}px, ${offsetY + dy}px)`;
      setStartX(event.clientX);
      setStartY(event.clientY);
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

  const handleMouseDown = (index, event) => {
    if (selectedTool === 'text') {
      setDraggingIndex(index);
      const textBox = textBoxes[index];
      setDragOffset({
        x: event.clientX - (textBox.position.left / 100) * window.innerWidth,
        y: event.clientY - (textBox.position.top / 100) * window.innerHeight,
      });
      setStartX(event.clientX);
      setStartY(event.clientY);
    }
  };

  const handleMouseMove = (event) => {
    if (draggingIndex !== null) {
      const newLeft = (event.clientX - dragOffset.x) / window.innerWidth * 100;
      const newTop = (event.clientY - dragOffset.y) / window.innerHeight * 100;
      setTextBoxes(prevTextBoxes => {
        const updatedTextBoxes = [...prevTextBoxes];
        // 텍스트 박스의 위치가 CanvasContainer 영역을 벗어나지 않도록 제한
        const canvasContainer = document.querySelector('.canvas-container');
        const boundingRect = canvasContainer.getBoundingClientRect();
        const textBoxWidth = updatedTextBoxes[draggingIndex].fontSize * scale;
        const textBoxHeight = updatedTextBoxes[draggingIndex].fontSize * scale;
        updatedTextBoxes[draggingIndex].position.left = Math.max(0, Math.min(newLeft, 100 - (textBoxWidth / boundingRect.width) * 100));
        updatedTextBoxes[draggingIndex].position.top = Math.max(0, Math.min(newTop, 100 - (textBoxHeight / boundingRect.height) * 100));
        return updatedTextBoxes;
      });
    }

    if (resizingIndex !== null) {
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      setTextBoxes(prevTextBoxes => {
        const updatedTextBoxes = [...prevTextBoxes];
        const newWidth = updatedTextBoxes[resizingIndex].width + dx;
        const newHeight = updatedTextBoxes[resizingIndex].height + dy;
        updatedTextBoxes[resizingIndex].width = Math.max(20, newWidth);
        updatedTextBoxes[resizingIndex].height = Math.max(10, newHeight);
        setStartX(event.clientX);
        setStartY(event.clientY);
        return updatedTextBoxes;
      });
    }

    if (rotatingIndex !== null) {
      const textBox = textBoxes[rotatingIndex];
      const centerX = textBox.position.left + textBox.width / 2;
      const centerY = textBox.position.top + textBox.height / 2;
      const radians = Math.atan2(event.clientY - centerY, event.clientX - centerX);
      const degrees = radians * (180 / Math.PI);
      setTextBoxes(prevTextBoxes => {
        const updatedTextBoxes = [...prevTextBoxes];
        updatedTextBoxes[rotatingIndex].rotation = degrees;
        return updatedTextBoxes;
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
    setResizingIndex(null);
    setRotatingIndex(null);
    onSaveHistory(drawingCanvasRef.current);
  };

  const handleTextClick = (index) => {
    if (selectedTool === 'text') {
      setEditingIndex(index);
    }
  };

  const handleInputBlur = (index) => {
    setEditingIndex(null);
    onSaveHistory(drawingCanvasRef.current);
  };

  const handleInputChange = (index, event) => {
    const newText = event.target.value;
    setTextBoxes(prevTextBoxes => {
      const updatedTextBoxes = [...prevTextBoxes];
      updatedTextBoxes[index].text = newText;
      return updatedTextBoxes;
    });
  };

  useEffect(() => {
    if (draggingIndex !== null || resizingIndex !== null || rotatingIndex !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [draggingIndex, resizingIndex, rotatingIndex]);

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
      {textBoxes.map((textBox, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: `${textBox.position.top}%`,
            left: `${textBox.position.left}%`,
            width: `${textBox.width}px`,
            height: `${textBox.height}px`,
            fontSize: `${textBox.fontSize * scale}vh`,
            color: textBox.color,
            fontFamily: textBox.fontFamily,
            whiteSpace: 'nowrap',
            cursor: selectedTool === 'text' ? 'move' : 'default',
            border: editingIndex === index ? '1px dashed #000' : 'none',
            transform: `rotate(${textBox.rotation}deg)`,
            transformOrigin: 'center',
          }}
          onMouseDown={(event) => handleMouseDown(index, event)}
          onClick={() => handleTextClick(index)}
        >
          {editingIndex === index ? (
            <input
              type="text"
              value={textBox.text}
              onBlur={() => handleInputBlur(index)}
              onChange={(event) => handleInputChange(index, event)}
              style={{
                fontSize: `${textBox.fontSize * scale}vh`,
                color: textBox.color,
                fontFamily: textBox.fontFamily,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '100%',
                height: '100%',
                textAlign: 'center',
                transform: `rotate(${-textBox.rotation}deg)`, // 회전 중일 때 텍스트 입력 필드를 회전하지 않게 유지
              }}
              autoFocus
            />
          ) : (
            textBox.text || textBox.emoji
          )}
          {selectedTool === 'text' && (
            <>
              <div
                className="resize-handle"
                style={{ position: 'absolute', right: 0, bottom: 0, cursor: 'nwse-resize' }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setResizingIndex(index);
                  setStartX(e.clientX);
                  setStartY(e.clientY);
                }}
              ></div>
              <div
                className="rotate-handle"
                style={{ position: 'absolute', right: '50%', top: -20, cursor: 'pointer' }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setRotatingIndex(index);
                }}
              ></div>
            </>
          )}
        </div>
      ))}
      {!image && <div className="placeholder">이미지를 불러와 주세요</div>}
    </div>
  );
});

export default CanvasComponent;
