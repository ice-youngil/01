import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './model.css';

const Model = () => {
  const location = useLocation();
  const { image } = location.state || {};
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!image) return;

    // Clean up previous renderer if it exists
    if (rendererRef.current) {
      containerRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
    }

    // Create a new renderer, scene, and camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 3.5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0xffffff);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      const imgWidth = img.width;
      const imgHeight = img.height;

      const aspectRatio = imgWidth / imgHeight;
      const boxWidth = 2 * aspectRatio;
      const boxHeight = 2;

      const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, 0.2);

      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(image);

      const materials = [
        new THREE.MeshBasicMaterial({ color: 0xaaaaaa }), // front
        new THREE.MeshBasicMaterial({ color: 0xaaaaaa }), // back
        new THREE.MeshBasicMaterial({ color: 0xaaaaaa }), // top
        new THREE.MeshBasicMaterial({ color: 0xaaaaaa }), // bottom
        new THREE.MeshBasicMaterial({ map: texture }), // left (image face)
        new THREE.MeshBasicMaterial({ color: 0xaaaaaa }), // right
      ];

      const box = new THREE.Mesh(geometry, materials);
      scene.add(box);

      const outlineGeometry = new THREE.BoxGeometry(boxWidth + 0.2, boxHeight + 0.2, 0.2);
      const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.BackSide });

      const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
      scene.add(outline);

      const animate = () => {
        requestAnimationFrame(animate);

        box.rotation.y -= 0.005;
        outline.rotation.y -= 0.005;

        renderer.render(scene, camera);
      };

      animate();
    };
  }, [image]);

  useEffect(() => {
    const handleResize = () => {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.setSize(width, height);
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="model-popup">
      <div className="model-popup-content" ref={containerRef}></div>
    </div>
  );
};

export default Model;
