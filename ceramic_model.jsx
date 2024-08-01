import React, { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './model.css';

const Model = () => {
  // useLocation hook to receive the image data passed from SketchToolHome
  const location = useLocation();
  // useNavigate hook to navigate back to SketchToolHome
  const navigate = useNavigate();
  const { image } = location.state || {}; // Destructure the image data from location state
  const containerRef = useRef(null); // Reference for the container where the Three.js renderer will be placed
  const rendererRef = useRef(null); // Reference for the Three.js renderer
  const cameraRef = useRef(null); // Reference for the Three.js camera
  const sceneRef = useRef(null); // Reference for the Three.js scene

  useEffect(() => {
    // If no image is passed, do nothing
    if (!image) return;

    // If a renderer already exists, clean up the previous renderer
    if (rendererRef.current) {
      containerRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
    }

    // Create a new Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create a new camera with perspective projection
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5; // Set camera distance
    cameraRef.current = camera;

    // Create a new WebGL renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0xffffff); // Set background color to white
    containerRef.current.appendChild(renderer.domElement); // Append the renderer to the container
    rendererRef.current = renderer;

    // Create orbit controls to allow user interaction with the camera
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Enable damping (inertia)
    controls.dampingFactor = 0.05; // Damping factor
    controls.screenSpacePanning = false; // Disable screen space panning

    // Load the image as a texture and apply it to a pottery geometry
    const img = new Image();
    img.src = image;
    img.onload = () => {
      const imgWidth = img.width;
      const imgHeight = img.height;

      // Calculate the aspect ratio of the image
      const aspectRatio = imgWidth / imgHeight;

      // Define the points that outline the shape of the pottery, scaled based on aspect ratio
      const points = [];
      for (let i = 0; i <= 20; i++) {
        const x = (Math.sin(i * 0.1) * 0.5 + 0.5) * aspectRatio;
        const y = (i - 10) * 0.2;
        points.push(new THREE.Vector2(x, y));
      }

      // Create a lathe geometry by rotating the points around the Y-axis
      const geometry = new THREE.LatheGeometry(points, 32);

      // Load the image as a texture
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(image);

      // Create a material with the loaded texture
      const material = new THREE.MeshBasicMaterial({ map: texture });

      // Create a mesh using the lathe geometry and the material
      const pottery = new THREE.Mesh(geometry, material);
      scene.add(pottery); // Add the mesh to the scene

      // Create an outline geometry slightly larger than the pottery for a border effect
      const outlinePoints = points.map(p => new THREE.Vector2(p.x * 1.05, p.y));
      const outlineGeometry = new THREE.LatheGeometry(outlinePoints, 32);
      // Create a material for the outline with a different color
      const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.BackSide });

      // Create an outline mesh using the outline geometry and material
      const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
      scene.add(outline); // Add the outline mesh to the scene

      // Function to animate the scene, including rotation of the pottery and outline
      const animate = () => {
        requestAnimationFrame(animate); // Request the next frame

        // Rotate the pottery and outline slightly on each frame
        pottery.rotation.y -= 0.005;
        outline.rotation.y -= 0.005;

        // Render the scene from the perspective of the camera
        renderer.render(scene, camera);
      };

      animate(); // Start the animation loop
    };
  }, [image]); // Effect depends on the image; re-runs if the image changes

  useEffect(() => {
    // Function to handle window resizing
    const handleResize = () => {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      // Update the renderer and camera size/aspect ratio when the window resizes
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.setSize(width, height);
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
    };

    // Add the resize event listener
    window.addEventListener('resize', handleResize);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array means this effect only runs once on mount

  // Function to handle the "Close" button click, navigating back to the SketchToolHome
  const handleClose = () => {
    navigate('/sketchtoolhome'); // Navigate to the SketchToolHome component
  };

  return (
    <div className="model-popup">
      {/* Close button to go back to SketchToolHome */}
      <button className="close-button" onClick={handleClose}>Close</button>
      {/* Container for the Three.js renderer */}
      <div className="model-popup-content" ref={containerRef}></div>
    </div>
  );
};

export default Model;
