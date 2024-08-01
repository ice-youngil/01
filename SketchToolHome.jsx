import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarButton from '../components/SidebarButton';
import './SketchToolHome.css';
import applyIcon from '../assets/images/emojione-monotone-up-arrow.png';
import textButtonIcon from '../assets/images/text.png';
import eraserButtonIcon from '../assets/images/eraser.png';
import elementButtonIcon from '../assets/images/element.png';
import penButtonIcon from '../assets/images/pen.png';
import designButtonIcon from '../assets/images/design.png';
import backButtonIcon from '../assets/images/back.png';
import handIcon from '../assets/images/hand.png';

const SketchToolHome = () => {
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState('pen');
  const [image, setImage] = useState(null);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [scale, setScale] = useState(1);
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          const scale = 1.3;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
          setImage(canvas.toDataURL('image/png'));
          saveHistory(canvas);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'sketch.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleApplyModel = () => {
    if (image) {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL('image/png');
      navigate('/model', { state: { image: dataUrl } });
    } else {
      alert('이미지를 먼저 업로드해주세요.');
    }
  };

  const saveHistory = (canvas) => {
    const dataUrl = canvas.toDataURL();
    setHistory((prevHistory) => [...prevHistory.slice(0, currentStep + 1), dataUrl]);
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handleUndo = () => {
    if (currentStep > 0) {
      setCurrentStep((prevStep) => prevStep - 1);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const img = new Image();
      img.src = history[currentStep - 1];
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
      };
    }
  };

  const handleWheel = (event) => {
    if (isAltPressed) {
      event.preventDefault();
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const newScale = Math.min(Math.max(0.1, scale + event.deltaY * -0.001), 5);
      const scaleDiff = newScale - scale;
      setScale(newScale);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const dx = (centerX - mouseX) * scaleDiff;
      const dy = (centerY - mouseY) * scaleDiff;
      setOffsetX((prevOffsetX) => prevOffsetX + dx);
      setOffsetY((prevOffsetY) => prevOffsetY + dy);

      canvas.style.transform = `scale(${newScale}) translate(${offsetX + dx}px, ${offsetY + dy}px)`;
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
      const dx = (event.clientX - startX) * 0.5;
      const dy = (event.clientY - startY) * 0.5;
      setOffsetX((prevOffsetX) => prevOffsetX + dx);
      setOffsetY((prevOffsetY) => prevOffsetY + dy);
      const canvas = canvasRef.current;
      canvas.style.transform = `scale(${scale}) translate(${offsetX + dx}px, ${offsetY + dy}px)`;
      setStartX(event.clientX);
      setStartY(event.clientY);
    }
  };

  const stopPanning = () => {
    setIsPanning(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Alt') {
      setIsAltPressed(true);
    }
  };

  const handleKeyUp = (event) => {
    if (event.key === 'Alt') {
      setIsAltPressed(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.strokeStyle = 'black';
    context.lineWidth = 5;
    contextRef.current = context;

    window.addEventListener('wheel', handleWheel);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', startPanning);
    window.addEventListener('mousemove', pan);
    window.addEventListener('mouseup', stopPanning);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', startPanning);
      window.removeEventListener('mousemove', pan);
      window.removeEventListener('mouseup', stopPanning);
    };
  }, [scale, isAltPressed, isPanning, offsetX, offsetY]);

  const startDrawing = ({ nativeEvent }) => {
    if (selectedTool === 'pen' || selectedTool === 'eraser') {
      const { offsetX, offsetY } = nativeEvent;
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    }
  };

  const finishDrawing = () => {
    if (isDrawing) {
      contextRef.current.closePath();
      setIsDrawing(false);
      saveHistory(canvasRef.current);
    }
  };

  const draw = ({ nativeEvent }) => {
    if (isDrawing) {
      const { offsetX, offsetY } = nativeEvent;
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
    }
  };

  useEffect(() => {
    if (selectedTool === 'eraser') {
      contextRef.current.strokeStyle = 'white';
      contextRef.current.lineWidth = 10;
    } else if (selectedTool === 'pen') {
      contextRef.current.strokeStyle = 'black';
      contextRef.current.lineWidth = 5;
    }
  }, [selectedTool]);

  return (
    <div className="sketchtoolhome-container">
      <div className="top-bar">
        <button className="back-button" onClick={() => navigate('/')}>
          <span>&lt;</span>
        </button>
        <button className="home-button">
          <span>홈</span>
        </button>
        <div className="separator"></div>
        <div className="load-sketch-button">
          <label>
            <span>스케치<br />불러오기</span>
            <input type="file" onChange={handleImageUpload} />
          </label>
        </div>
        <button className="save-button" onClick={handleSaveImage}>
          저장하기
        </button>
      </div>
      <div className="sidebar-buttons">
        <SidebarButton icon={textButtonIcon} label="텍스트" onClick={() => setSelectedTool('text')} />
        <SidebarButton icon={eraserButtonIcon} label="지우개" onClick={() => setSelectedTool('eraser')} />
        <SidebarButton icon={elementButtonIcon} label="요소" onClick={() => setSelectedTool('element')} />
        <SidebarButton icon={penButtonIcon} label="펜" onClick={() => setSelectedTool('pen')} />
        <SidebarButton icon={designButtonIcon} label="문패지정" onClick={() => setSelectedTool('design')} />
        <SidebarButton icon={backButtonIcon} label="되돌리기" onClick={handleUndo} />
        <SidebarButton icon={handIcon} onClick={() => setSelectedTool('hand')} />
      </div>
      <div className={`canvas-container ${isPanning ? 'canvas-panning' : ''}`}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseMove={draw}
          className={image ? 'active-canvas' : 'inactive-canvas'}
        />
        {!image && <div className="placeholder">이미지를 불러와 주세요</div>}
      </div>
      <div className="apply-button-container">
        <button className="apply-button" onClick={handleApplyModel}>
          <span>적용하기</span>
          <img className="apply-icon" src={applyIcon} alt="Apply" />
        </button>
      </div>
    </div>
  );
};

export default SketchToolHome;
