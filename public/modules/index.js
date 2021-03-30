///<reference path="./vendor/three/types/index.d.ts" />
import * as THREE from "./vendor/three/three.module.min.js";

async function getShader(url) {
  const response = await fetch(url);
  if (!response.ok) {
    return "";
  }
  return await response.text();
}

(async function () {
  const container = window.document.querySelector("#container");
  const startTime = Date.now();

  const camera = new THREE.Camera();
  camera.position.z = 1;
  const scene = new THREE.Scene();
  const uniforms = {
    time: { value: 1.0 },
    resolution: { value: new THREE.Vector2() },
  };

  const vertexShader = await getShader("./shader.vert");
  const fragmentShader = await getShader("./shader.frag");

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);

  scene.add(mesh);

  const renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
  container.appendChild(renderer.domElement);

  uniforms.resolution.value.x = window.innerWidth;
  uniforms.resolution.value.y = window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);

  function render(time) {
    const elapsedMS = Date.now() - startTime;
    const elapsedS = elapsedMS / 1000;

    uniforms.time.value = elapsedS;
    renderer.render(scene, camera);
  }

  function animate(time) {
    window.requestAnimationFrame(animate);
    render(time);
  }
  animate();

  window.onresize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
})();
