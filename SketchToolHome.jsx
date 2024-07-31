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
import backButtonIcon from '../assets/images/back.png'; // 되돌리기 아이콘 임포트

const SketchToolHome = () => {
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState('pen'); // 선택된 도구 상태
  const [image, setImage] = useState(null); // 업로드된 이미지 상태
  const canvasRef = useRef(null); // 캔버스 엘리먼트 참조
  const contextRef = useRef(null); // 캔버스 컨텍스트 참조
  const [isDrawing, setIsDrawing] = useState(false); // 그리기 중 여부 상태
  const [history, setHistory] = useState([]); // 캔버스 상태 히스토리
  const [currentStep, setCurrentStep] = useState(-1); // 현재 히스토리 단계
  const [scale, setScale] = useState(1); // 캔버스 스케일 상태
  const [isAltPressed, setIsAltPressed] = useState(false); // Alt 키 상태

  // 이미지 업로드 핸들러
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
          context.clearRect(0, 0, canvas.width, canvas.height); // 이전 그리기 내용 지우기
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
          setImage(canvas.toDataURL('image/png'));
          saveHistory(canvas); // 업로드 후 히스토리에 저장
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지 저장 핸들러
  const handleSaveImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'sketch.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  // 모델 적용 핸들러
  const handleApplyModel = () => {
    if (image) {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL('image/png');
      const newWindow = window.open('/model', '_blank', 'width=800,height=600');
      newWindow.modelImage = dataUrl;
    } else {
      alert('이미지를 먼저 업로드해주세요.');
    }
  };

  // 히스토리에 캔버스 상태 저장
  const saveHistory = (canvas) => {
    const dataUrl = canvas.toDataURL();
    setHistory((prevHistory) => [...prevHistory.slice(0, currentStep + 1), dataUrl]);
    setCurrentStep((prevStep) => prevStep + 1);
  };

  // 되돌리기 핸들러
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

  // 캔버스 줌 핸들러
  const handleWheel = (event) => {
    if (isAltPressed) {
      event.preventDefault();
      const newScale = Math.min(Math.max(0.5, scale + event.deltaY * -0.001), 3);
      setScale(newScale);
      const canvas = canvasRef.current;
      canvas.style.transform = `scale(${newScale})`;
    }
  };

  // Alt 키 눌림 상태 관리
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

  // 컴포넌트 마운트 시 캔버스 초기화
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

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [scale, isAltPressed]);

  // 그리기 시작 핸들러
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  // 그리기 종료 핸들러
  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
    saveHistory(canvasRef.current); // 그리기 종료 후 히스토리에 저장
  };

  // 그리기 중 핸들러
  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  // 도구 변경 시 컨텍스트 업데이트
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
        <SidebarButton icon={backButtonIcon} label="되돌리기" onClick={handleUndo} /> {/* 되돌리기 버튼 */}
      </div>
      <div className="canvas-container">
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
