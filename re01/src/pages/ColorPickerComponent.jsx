import React from 'react';
import { TwitterPicker, SliderPicker } from 'react-color';

const ColorPickerComponent = ({ selectedColor, setSelectedColor }) => {
  const handleChangeComplete = (color) => {
    setSelectedColor(color.hex);
  };

  return (
    <div className="color-picker-container">
      <TwitterPicker
        color={selectedColor}
        onChangeComplete={handleChangeComplete}
        triangle="hide"
      />
      <SliderPicker
        color={selectedColor}
        onChangeComplete={handleChangeComplete}
      />
    </div>
  );
};

export default ColorPickerComponent;
