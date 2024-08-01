import React from 'react';
import { useNavigate } from 'react-router-dom';
import background from '../assets/images/background73_287.png';
import './SketchToolSelectScreen.css';

// SketchToolSelectScreen 컴포넌트 정의
const SketchToolSelectScreen = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 훅 사용

  // "시작하기" 버튼 클릭 핸들러
  const handleStartClick = () => {
    navigate('/sketchtoolhome'); // 스케치 도구 홈으로 이동
  };

  return (
    <div className="container">
      {/* 배경 이미지 컨테이너 */}
      <div className="background-container">
        <img className="background-image" src={background} alt="Background" />
      </div>
      {/* 제목 컨테이너 */}
      <div className="title-container">
        <div className="title-text">
          영일도방 문패 디자인 편집기
        </div>
      </div>
      {/* 시작 버튼 */}
      <button className="start-button" onClick={handleStartClick}>
        시작하기
      </button>
    </div>
  );
};

export default SketchToolSelectScreen;
