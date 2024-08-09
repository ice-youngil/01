// ToolSettings.jsx

import React from 'react';
import Picker from 'emoji-picker-react'; // 이모지 선택기 import
import './ToolSettings.css';

const ToolSettings = ({
  selectedTool,
  toolSize,
  setToolSize,
  selectedColor,
  setSelectedColor,
  eraserSize,
  setEraserSize,
  showEmojiPicker,
  closeSettings,
  addEmojiToCanvas
}) => {
  const handleSelectEmoji = (event, emojiObject) => {
    console.log('Selected Emoji:', emojiObject);
    if (addEmojiToCanvas) {
      addEmojiToCanvas(emojiObject.unified);
    }
    closeSettings(); // 이모지 선택 후 설정 창 닫기
  };

  return (
    <div className="tool-settings">
      {selectedTool === 'pen' && (
        <div className="pen-settings-picker">
          <input
            type="range"
            min="1"
            max="20"
            value={toolSize}
            onChange={(e) => setToolSize(Number(e.target.value))}
            className="tool-size-slider"
          />
          <div className="color-picker-container">
            <label>색상</label>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            />
          </div>
          <button className="close-button" onClick={closeSettings}>
            닫기
          </button>
        </div>
      )}

      {selectedTool === 'eraser' && (
        <div className="eraser-settings-picker">
          <input
            type="range"
            min="1"
            max="70"
            value={eraserSize}
            onChange={(e) => setEraserSize(Number(e.target.value))}
            className="tool-size-slider"
          />
          <button className="close-button" onClick={closeSettings}>
            닫기
          </button>
        </div>
      )}

      {selectedTool === 'emoji' && showEmojiPicker && (
        <div className="emoji-picker-container">
          <Picker onEmojiClick={handleSelectEmoji} />
        </div>
      )}
    </div>
  );
};

export default ToolSettings;
