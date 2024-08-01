// ShapeSelectionModal.js
import React from 'react';
import './ShapeSelectionModal.css';

const ShapeSelectionModal = ({ isOpen, onClose, onSelectShape }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>모양 선택</h2>
        <button onClick={() => onSelectShape('rectangle')}>직사각형</button>
        <button onClick={() => onSelectShape('pottery')}>도자기모양</button>
        <button className="close-button" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default ShapeSelectionModal;
