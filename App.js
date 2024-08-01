import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SketchToolSelectScreen from './pages/SketchToolSelectScreen';
import SketchToolHome from './pages/SketchToolHome';
import RectangleModel from './pages/rectangle_model';
import CeramicModel from './pages/ceramic_model';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SketchToolSelectScreen />} />
        <Route path="/sketchtoolhome" element={<SketchToolHome />} />
        <Route path="/rectangle_model" element={<RectangleModel />} />
        <Route path="/ceramic_model" element={<CeramicModel />} />
      </Routes>
    </Router>
  );
}

export default App;
