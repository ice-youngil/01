import React, { useState } from 'react';
import './ToolSettings.css';

const TextTool = ({ onAddText, closeSettings, canvasWidth, canvasHeight }) => {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(2); // % 단위로 설정
  const [color, setColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');

  const handleAddText = () => {
    // 텍스트 박스의 초기 위치를 캔버스 크기에 따라 동적으로 설정
    const initialPosition = {
      top: Math.min(10, (canvasHeight - fontSize) / canvasHeight * 100), // 위쪽 여백이 10%를 넘지 않도록 제한
      left: Math.min(10, (canvasWidth - fontSize * 5) / canvasWidth * 100) // 왼쪽 여백이 10%를 넘지 않도록 제한
    };

    onAddText({
      text,
      fontSize,
      color,
      fontFamily,
      position: initialPosition
    });
    setText('');
  };

  return (
    <div className="text-tool">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="텍스트 입력"
      />
      <div className="text-settings">
        <label>
          글자 크기 (%):
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(parseFloat(e.target.value))}
            step="0.1"
            min="0.1"
          />
        </label>
        <label>
          색상:
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>
        <label>
          폰트:
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
          >
            <option value="Arial">Arial</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
          </select>
        </label>
      </div>
      <button onClick={handleAddText}>텍스트 추가</button>
    </div>
  );
};

export default TextTool;
