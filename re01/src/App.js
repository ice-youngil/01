import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SketchToolSelectScreen from './pages/SketchToolSelectScreen';
import SketchToolHome from './pages/SketchToolHome';
import Model from './pages/model';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SketchToolSelectScreen />} />
        <Route path="/sketchtoolhome" element={<SketchToolHome />} />
        <Route path="/model" element={<Model />} />
      </Routes>
    </Router>
  );
}

export default App;
