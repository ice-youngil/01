import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarButton from '../components/SidebarButton';
import CanvasComponent from './CanvasComponent'; // 새 컴포넌트 임포트
import ShapeSelectionModal from './ShapeSelectionModal'; // 모달 컴포넌트 임포트
import './SketchToolHome.css';
import textButtonIcon from '../assets/images/text.png';
import eraserButtonIcon from '../assets/images/eraser.png';
import elementButtonIcon from '../assets/images/element.png';
import penButtonIcon from '../assets/images/pen.png';
// import designButtonIcon from '../assets/images/design.png';
import backButtonIcon from '../assets/images/back.png';
import handIcon from '../assets/images/hand.png';

const SketchToolHome = () => {
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState('pen');
  const [image, setImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [toolSize, setToolSize] = useState(5);
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태

  // 이미지 업로드 핸들러
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result); // 이미지를 상태로 저장
        saveHistory(e.target.result); // 업로드 후 히스토리에 저장
        setToolSize(5); // 이미지 크기에 따른 도구 크기 설정
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지 저장 핸들러
  const handleSaveImage = () => {
    // 이미지 저장 로직을 CanvasComponent 내에서 수행
    document.querySelector('.save-button').click();
  };

  // 모델 적용 핸들러
  const handleApplyModel = () => {
    if (image) {
      setIsModalOpen(true); // 모달 열기
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
      setImage(history[currentStep - 1]); // 이전 단계로 되돌리기
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSelectShape = (shape) => {
    setIsModalOpen(false);

    if (shape === 'pottery') {
      navigate('/ceramic_model', { state: { image } });
    } else {
      navigate('/rectangle_model', { state: { image, shape } });
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
        <SidebarButton icon={eraserButtonIcon} label="지우개" onClick={() => setSelectedTool('eraser')} />
        <SidebarButton icon={elementButtonIcon} label="요소" onClick={() => setSelectedTool('element')} />
        <SidebarButton icon={penButtonIcon} label="펜" onClick={() => setSelectedTool('pen')} />
        {/* <SidebarButton icon={designButtonIcon} label="문패지정" onClick={() => setSelectedTool('design')} /> */}
        <SidebarButton icon={backButtonIcon} label="되돌리기" onClick={handleUndo} />
        <SidebarButton icon={handIcon} label="손" onClick={() => setSelectedTool('hand')} />
      </div>
      {/* CanvasComponent를 사용하여 캔버스 기능을 분리 */}
      <CanvasComponent
        selectedTool={selectedTool}
        toolSize={toolSize}
        image={image}
        onSaveHistory={saveHistory}
        isAltPressed={isAltPressed}
      />
      {/* ShapeSelectionModal 추가 */}
      <ShapeSelectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelectShape={handleSelectShape}
      />
    </div>
  );
};

export default SketchToolHome;
