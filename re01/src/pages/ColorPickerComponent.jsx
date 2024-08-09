import React from 'react';
import { ChromePicker } from 'react-color'; // 'react-color' 라이브러리 사용

const ColorPickerComponent = ({ selectedColor, setSelectedColor }) => {
  const handleColorChange = (color) => {
    setSelectedColor(color.hex);
  };

  return (
    <div>
      <ChromePicker 
        color={selectedColor} 
        onChange={handleColorChange} 
        disableAlpha={true} // 투명도 선택 비활성화 (필요에 따라 조정 가능)
      />
    </div>
  );
};

export default ColorPickerComponent;
