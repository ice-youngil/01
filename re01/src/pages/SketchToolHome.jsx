import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarButton from '../components/SidebarButton';
import CanvasComponent from './CanvasComponent';
import ToolSettings from './ToolSettings';
import TextTool from './TextTool';
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
  const canvasRef = useRef(null);
  const [selectedTool, setSelectedTool] = useState('pen');
  const [image, setImage] = useState(null);
  const [toolSize, setToolSize] = useState(5);
  const [eraserSize, setEraserSize] = useState(10);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showTextTool, setShowTextTool] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showToolSettings, setShowToolSettings] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (canvasRef.current) {
          canvasRef.current.clearCanvas();
        }
        const newImage = e.target.result;
        setImage(newImage);
        setHistory([newImage]);
        setCurrentStep(0);
        setToolSize(5);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveHistory = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.getMergedImage();
      setHistory((prevHistory) => [...prevHistory.slice(0, currentStep + 1), dataUrl]);
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  const handleUndo = () => {
    if (currentStep > 0) {
      setCurrentStep((prevStep) => prevStep - 1);
      const previousImage = history[currentStep];
      setImage(previousImage);
    } else if (currentStep === 0 && history.length > 1) {
      setImage(history[0]);
    } else if (currentStep === 0 && history.length === 1) {
      setImage(history[0]);
    }
  };

  const handleSaveImage = () => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.getMergedImage();
      const link = document.createElement('a');
      link.download = 'sketch.png';
      link.href = dataURL;
      link.click();
    }
  };

  const handleApplyModel = () => {
    if (image) {
      const dataUrl = canvasRef.current.getMergedImage();
      navigate('/model', { state: { image: dataUrl } });
    } else {
      alert('이미지를 먼저 업로드해주세요.');
    }
  };

  const handleButtonClick = (tool) => {
    // 모든 설정 창 닫기
    setShowTextTool(false);
    setShowEmojiPicker(false);
    setShowToolSettings(false);

    // 선택된 도구에 따라 동작 설정
    if (tool === 'text') {
      // 텍스트 도구를 선택할 때 다른 도구 비활성화
      setSelectedTool('text');
      setShowTextTool(true);
    } else {
      setSelectedTool(tool);

      if (tool === 'emoji') {
        setShowEmojiPicker(true);
      } else if (tool === 'pen' || tool === 'eraser') {
        setShowToolSettings(true);
      }
    }
  };

  const closeSettings = () => {
    setShowToolSettings(false);
    setShowTextTool(false);
    setShowEmojiPicker(false);
  };

  const handleAddText = (textSettings) => {
    if (canvasRef.current) {
      canvasRef.current.addText(textSettings);
      saveHistory();
    }
  };
  
  const handleSelectEmoji = (emoji) => {
    if (canvasRef.current) {
      canvasRef.current.addEmoji(emoji);
      saveHistory();
    }
  };

  return (
    <div className="sketch-tool-home">
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
        <SidebarButton icon={textButtonIcon} label="텍스트" onClick={() => handleButtonClick('text')} />
        <SidebarButton icon={eraserButtonIcon} label="지우개" onClick={() => handleButtonClick('eraser')} />
        <SidebarButton icon={elementButtonIcon} label="요소" onClick={() => handleButtonClick('emoji')} />
        <SidebarButton icon={penButtonIcon} label="펜" onClick={() => handleButtonClick('pen')} />
        <SidebarButton icon={designButtonIcon} label="문패지정" onClick={() => handleButtonClick('design')} />
        <SidebarButton icon={backButtonIcon} label="되돌리기" onClick={handleUndo} />
        <SidebarButton icon={handIcon} onClick={() => handleButtonClick('hand')} />
      </div>
      {(selectedTool === 'pen' || selectedTool === 'eraser') && showToolSettings && (
        <ToolSettings
          selectedTool={selectedTool}
          toolSize={toolSize}
          setToolSize={setToolSize}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          eraserSize={eraserSize}
          setEraserSize={setEraserSize}
          showEmojiPicker={showEmojiPicker}
          closeSettings={closeSettings}
          addEmojiToCanvas={handleSelectEmoji}
        />
      )}
      {showTextTool && (
        <div className="text-tool-container">
          <TextTool onAddText={handleAddText} />
          <button className="cancel-button" onClick={closeSettings}>
            닫기
          </button>
        </div>
      )}
      {showEmojiPicker && (
        <ToolSettings
          selectedTool="emoji"
          showEmojiPicker={showEmojiPicker}
          closeSettings={closeSettings}
        />
      )}
      <CanvasComponent
        ref={canvasRef}
        selectedTool={selectedTool}
        toolSize={toolSize}
        eraserSize={eraserSize}
        image={image}
        onSaveHistory={saveHistory}
        selectedColor={selectedColor}
      />
    </div>
  );
};

export default SketchToolHome;
