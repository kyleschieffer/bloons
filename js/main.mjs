// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Create a Three.JS Scene
const scene = new THREE.Scene();

// Load the background texture
const textureLoader = new THREE.TextureLoader();
textureLoader.load("./bliss.jpg", function(texture) {
    scene.background = texture;
});

// Create a new camera with positions and angles
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(.25, .03, .6);

// Set which object to render
let objToRender = 'hand';

// The object
let object;

// Instantiate a loader for the .gltf file
const loader = new GLTFLoader();

// Keep a dictionary of material names
let materialNames = {};

// Load the file
loader.load(
  `./models/${objToRender}.glb`,
  function (gltf) {
    // If the file is loaded, add it to the scene
    object = gltf.scene;
    object.position.set(0, 0, 0); // Set the object position
    scene.add(object);

    // Store the material names in the dictionary
    object.traverse(node => {
      if (node.isMesh) {
        materialNames[node.material.name] = true;
      }
    });

    // Log the material names to the console
    console.log(Object.keys(materialNames));
  },
  function (xhr) {
    // While it is loading, log the progress
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    // If there is an error, log it
    console.error(error);
  }
);

// Instantiate a new renderer and set its size
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Add the renderer to the DOM
document.getElementById("container3D").appendChild(renderer.domElement);

// Add lights to the scene, so we can actually see the 3D model
const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, objToRender === "hand" ? 5 : 1);
scene.add(ambientLight);

// This adds controls to the camera, so we can rotate / zoom it with the mouse
if (objToRender === "hand") {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', () => {
    console.log('Camera position:', camera.position);
    renderer.render(scene, camera);
  });
  controls.target.set(0, 0, 0);
  controls.update();
}

// Store the initial model position to compare with in the animation loop
let oldPosition = new THREE.Vector3();

// Add color change listeners to all color picker inputs
for (let i = 1; i <= 6; i++) {
  const colorPicker = document.getElementById(`component-${i}-color`);
  colorPicker.addEventListener('input', function(event) {
    const color = new THREE.Color(event.target.value);
    object.traverse(node => {
      if (node.isMesh && node.material.name === `Balloon_Arch_${i}`) {
        node.material.color = color;
      }
    });
  });
}

// Render the scene
function animate() {
  requestAnimationFrame(animate);
  
  // Check if the model's position has changed and log it if so
  if (!object.position.equals(oldPosition)) {
    console.log('Object position:', object.position);
    oldPosition = object.position.clone();
  }

  renderer.render(scene, camera);
}

animate();

// Add a listener to resize the window and the camera
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
