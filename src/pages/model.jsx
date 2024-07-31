 import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './model.css';
import { useLocation } from 'react-router-dom';
// import ReactDOM, { render } from 'react-dom';


const Model = () => {
  const mountRef = useRef(null);
  const location = useLocation();  
  const imgUrl = location.state.url;

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = 5;

    // 환경 조명 추가
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 방향성 조명 추가
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const img = new Image();
    img.src = imgUrl;
    img.onload = () => {
      // 이미지 사이즈 조절을 위해서
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const size = Math.max(img.width, img.height);
      canvas.width = size;
      canvas.height = size;

      // 흰 배경을 칠함
      context.fillStyle = 'white';
      context.fillRect(0, 0, size, size);

      // 이미지를 가운데에 그리기
      const x = (size - img.width) / 2;
      const y = (size - img.height) / 2;
      context.drawImage(img, x, y);

      // 텍스처로 로드
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(canvas.toDataURL(), function(texture) {
        const material = new THREE.MeshBasicMaterial({ map: texture });

        // 도자기 모양을 위한 점 배열 생성
        const points = [];
        for (let i = 0; i < 10; i++) {
          points.push(new THREE.Vector2(Math.sin(i * 0.2) * 2 + 1, (i - 5) * 0.5));
        }

        // LatheGeometry 생성
        const geometry = new THREE.LatheGeometry(points);

        // 메쉬 생성
        const pottery = new THREE.Mesh(geometry, material);
        scene.add(pottery);

        const animate = () => {
          requestAnimationFrame(animate);
          pottery.rotation.y += 0.005;
          renderer.render(scene, camera);
        }

        animate();
      });
    };
  }, [imgUrl]);

  return (
    <div ref={mountRef}></div>
  );
};

export default Model;



// const ModelPopup = ({ onClose }) => {
//   const mountRef = useRef(null);


//   useEffect(() => {
//     let scene, camera, renderer, controls;
//     const mount = mountRef.current;

//     const fetchModel = async () => {
//       try {
//         const response = await axios.get('http://localhost:4000/sketchfab-model/1234567890abcdef1234567890abcdef');
//         if (response.data.url) {
//           console.log('Fetched model URL:', response.data.url); // 모델 URL 확인
//           return response.data.url;
//         } else {
//           throw new Error('Model download URL not found');
//         }
//       } catch (error) {
//         console.error('Error fetching model:', error);
//         return null;
//       }
//     };






//     const init = async () => {
//       const width = mount.clientWidth;
//       const height = mount.clientHeight;

//       scene = new THREE.Scene();
//       camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
//       camera.position.set(0, 5, 15);

//       renderer = new THREE.WebGLRenderer({ antialias: true });
//       renderer.setSize(width, height);
//       renderer.setPixelRatio(window.devicePixelRatio);
//       mount.appendChild(renderer.domElement);

//       controls = new OrbitControls(camera, renderer.domElement);
//       controls.enableZoom = true;
//       controls.minDistance = 3;
//       controls.maxDistance = 30;

//       const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
//       hemiLight.position.set(0, 20, 0);
//       scene.add(hemiLight);

//       const spotLight = new THREE.SpotLight(0xffffff);
//       spotLight.position.set(10, 20, 10);
//       spotLight.castShadow = true;
//       scene.add(spotLight);

//       const modelUrl = await fetchModel();
//       if (modelUrl) {
//         console.log('Loading model from URL:', modelUrl); // 모델 로드 확인
//         const loader = new GLTFLoader();
//         loader.load(modelUrl, (gltf) => {
//           scene.add(gltf.scene);
//         });
//       }

//       window.addEventListener('resize', onWindowResize, false);
//       animate();
//     };

//     const onWindowResize = () => {
//       const width = mount.clientWidth;
//       const height = mount.clientHeight;
//       camera.aspect = width / height;
//       camera.updateProjectionMatrix();
//       renderer.setSize(width, height);
//     };

//     const animate = () => {
//       requestAnimationFrame(animate);
//       controls.update();
//       renderer.render(scene, camera);
//     };

//     init();

//     return () => {
//       if (mount) {
//         mount.removeChild(renderer.domElement);
//       }
//       window.removeEventListener('resize', onWindowResize);
//     };
//   }, []);

//   return (
//     <div className="model-popup">
//       <div className="model-popup-content" ref={mountRef}></div>
//       <button className="close-button" onClick={onClose}>Close</button>
//     </div>
//   );
// };