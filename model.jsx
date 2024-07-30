import React, { useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
//import { file } from '../pages/SketchToolHome';
import './model.css';

const App = () => {
  const fileInputRef = useRef();
  const containerRef = useRef();

  const loadFile = (event) => {
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      const imgWidth = img.width;
      const imgHeight = img.height;

      // Create scene
      const scene = new THREE.Scene();

      // Create camera
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;

      // Create renderer
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0xffffff); // Set background color to white
      containerRef.current.appendChild(renderer.domElement);

      // Create OrbitControls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;

      // Calculate box dimensions
      const aspectRatio = imgWidth / imgHeight;
      const boxWidth = 2 * aspectRatio;
      const boxHeight = 2;

      // Create box geometry
      const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, 0.2);

      // Load texture
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(url);

      // Create materials for each face
      const materials = [
        new THREE.MeshBasicMaterial({ color: 0xaaaaaa }), // front
        new THREE.MeshBasicMaterial({ color: 0xaaaaaa }), // back
        new THREE.MeshBasicMaterial({ color: 0xaaaaaa }), // top
        new THREE.MeshBasicMaterial({ color: 0xaaaaaa }), // bottom
        new THREE.MeshBasicMaterial({ map: texture }), // left (image face)
        new THREE.MeshBasicMaterial({ color: 0xaaaaaa }), // right
      ];

      // Create mesh with box geometry and materials
      const box = new THREE.Mesh(geometry, materials);
      scene.add(box);

      // Create outline geometry and material
      const outlineGeometry = new THREE.BoxGeometry(boxWidth + 0.2, boxHeight + 0.2, 0.2); // slightly larger for border effect
      const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.BackSide }); // red border

      // Create outline mesh and add to the scene
      const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
      scene.add(outline);

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);

        // Rotate the box and outline
        box.rotation.y += 0.005;
        outline.rotation.y += 0.005;

        renderer.render(scene, camera);
      };

      animate();
    };
  };

  return (
    <div className="model-popup">
      <div className="model-popup-content">
        <input type="file" accept="image/*" ref={fileInputRef} onChange={loadFile} />
        <div ref={containerRef}></div>
      </div>
    </div>
  );
};

export default App;
