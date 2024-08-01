import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarButton from '../components/SidebarButton';
import CanvasComponent from './CanvasComponent';
import ColorPickerComponent from './ColorPickerComponent';
import './SketchToolHome.css';
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
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [toolSize, setToolSize] = useState(5);
  const [eraserSize, setEraserSize] = useState(10); // 지우개 크기 상태 추가
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [showPenSettings, setShowPenSettings] = useState(false); // 펜 설정 창 상태
  const [showEraserSettings, setShowEraserSettings] = useState(false); // 지우개 설정 창 상태
  const [selectedColor, setSelectedColor] = useState('#000000'); // 선택된 색상 상태

  // 이미지 업로드 핸들러
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        saveHistory(e.target.result);
        setToolSize(5);
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지 저장 핸들러
  const handleSaveImage = () => {
    document.querySelector('.save-button').click();
  };

  // 모델 적용 핸들러
  const handleApplyModel = () => {
    if (image) {
      navigate('/model', { state: { image } });
    } else {
      alert('이미지를 먼저 업로드해주세요.');
    }
  };

  // 히스토리에 이미지 상태 저장
  const saveHistory = (image) => {
    setHistory((prevHistory) => [...prevHistory.slice(0, currentStep + 1), image]);
    setCurrentStep((prevStep) => prevStep + 1);
  };

  // 되돌리기 핸들러
  const handleUndo = () => {
    if (currentStep > 0) {
      setCurrentStep((prevStep) => prevStep - 1);
      setImage(history[currentStep - 1]);
    }
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
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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
        <button className="apply-button" onClick={handleApplyModel}>
          적용하기
        </button>
      </div>
      <div className="sidebar-buttons">
        <SidebarButton icon={textButtonIcon} label="텍스트" onClick={() => setSelectedTool('text')} />
        <div className="eraser-tool">
          <SidebarButton 
            icon={eraserButtonIcon} 
            label="지우개" 
            onClick={() => {
              setSelectedTool('eraser');
              setShowEraserSettings(!showEraserSettings); // 지우개 설정 창 토글
              setShowPenSettings(false); // 펜 설정 창 닫기
            }} 
          />
          {showEraserSettings && (
            <div className="tool-settings-picker">
              <input 
                type="range" 
                min="1" 
                max="50" 
                value={eraserSize} 
                onChange={(e) => setEraserSize(e.target.value)} 
                className="tool-size-slider" 
              />
            </div>
          )}
        </div>
        <SidebarButton icon={elementButtonIcon} label="요소" onClick={() => setSelectedTool('element')} />
        <div className="pen-tool">
          <SidebarButton 
            icon={penButtonIcon} 
            label="펜" 
            onClick={() => {
              setSelectedTool('pen');
              setShowPenSettings(!showPenSettings); // 펜 설정 창 토글
              setShowEraserSettings(false); // 지우개 설정 창 닫기
            }} 
          />
          {showPenSettings && (
            <div className="tool-settings-picker">
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={toolSize} 
                onChange={(e) => setToolSize(e.target.value)} 
                className="tool-size-slider" 
              />
              <ColorPickerComponent 
                selectedColor={selectedColor} 
                setSelectedColor={setSelectedColor} 
              />
            </div>
          )}
        </div>
        <SidebarButton icon={designButtonIcon} label="문패지정" onClick={() => setSelectedTool('design')} />
        <SidebarButton icon={backButtonIcon} label="되돌리기" onClick={handleUndo} />
        <SidebarButton icon={handIcon} label="손" onClick={() => setSelectedTool('hand')} />
      </div>
      <CanvasComponent
        selectedTool={selectedTool}
        toolSize={toolSize}
        eraserSize={eraserSize} // 지우개 크기 전달
        image={image}
        onSaveHistory={saveHistory}
        isAltPressed={isAltPressed}
        selectedColor={selectedColor} // 선택된 색상 전달
      />
    </div>
  );
};

export default SketchToolHome;
