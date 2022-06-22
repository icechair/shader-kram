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
  const vertexShader = await getShader("./shader.vert");
  const fragmentShader = await getShader("./shader.frag");

  const renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(new THREE.Color(0, 0, 0));

  const container = window.document.querySelector("#container");
  container.appendChild(renderer.domElement);

  const buffer_size = renderer.getDrawingBufferSize();
  const target_options = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    stencilBuffer: false,
  };
  let render_target_1 = new THREE.WebGLRenderTarget(
    buffer_size.width,
    buffer_size.height,
    target_options,
  );
  let render_target_2 = new THREE.WebGLRenderTarget(
    buffer_size.width,
    buffer_size.height,
    target_options,
  );

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const clock = new THREE.Clock();

  const geometry = new THREE.PlaneBufferGeometry(2, 2);
  const uniforms = {
    u_time: {
      type: "f",
      value: 0.0,
    },
    u_frame: {
      type: "f",
      value: 0.0,
    },
    u_resolution: {
      type: "v2",
      value: new THREE.Vector2(window.innerWidth, window.innerHeight)
        .multiplyScalar(
          window.devicePixelRatio,
        ),
    },
    u_mouse: {
      type: "v3",
      value: new THREE.Vector3(0, 0, 0),
    },
    u_texture: {
      type: "t",
      value: null,
    },
  };

  const material_schader = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
  });

  const mesh_shader = new THREE.Mesh(geometry, material_schader);

  const scene_shader = new THREE.Scene();
  scene_shader.add(mesh_shader);

  const material_screen = new THREE.MeshBasicMaterial();
  const mesh_screen = new THREE.Mesh(geometry, material_screen);

  const scene_screen = new THREE.Scene();
  scene_screen.add(mesh_screen);

  const render = () => {
    if (!uniforms.u_texture.value) {
      material_screen.visible = false;
      renderer.setRenderTarget(render_target_1);
      renderer.render(scene_screen, camera);
      material_screen.visible = true;
    }

    uniforms.u_time.value = clock.getElapsedTime();
    uniforms.u_frame.value += 1;
    uniforms.u_texture.value = render_target_1.texture;

    renderer.setRenderTarget(render_target_2);
    renderer.render(scene_shader, camera);

    material_screen.map = render_target_2.texture;
    material_screen.needsUpdate = true;
    renderer.setRenderTarget(null);

    renderer.render(scene_screen, camera);

    const tmp = render_target_1;
    render_target_1 = render_target_2;
    render_target_2 = tmp;
  };

  const animate = () => {
    requestAnimationFrame(animate);
    render();
  };

  const onWindowResize = (_e) => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    const size = renderer.getDrawingBufferSize();
    render_target_1.setSize(size.width, size.height);
    render_target_2.setSize(size.width, size.height);
    uniforms.u_resolution.value.set(width, height).multiplyScalar(
      window.devicePixelRatio,
    );
    uniforms.u_texture.value = null;
    material_screen.map = null;
    material_screen.needsUpdate = true;
  };
  // there is no webworker context here and never wi_ll be ...
  // deno-lint-ignore no-window-prefix
  window.addEventListener("resize", onWindowResize, false);

  const onMousemove = (e) => {
    const pos = new THREE.Vector2(e.pageX, window.innerHeight - e.pageY)
      .multiplyScalar(window.devicePixelRatio);

    console.log(
      "move",
      e.pageX,
      e.pageY,
      window.innerHeight,
      window.devicePixelRatio,
      pos,
    );

    uniforms.u_mouse.value.set(pos.x, pos.y, uniforms.u_mouse.value.z);
  };
  renderer.domElement.addEventListener("mousemove", onMousemove, false);

  const onMousedown = () => {
    uniforms.u_mouse.value.setZ(1);
  };
  renderer.domElement.addEventListener("mousedown", onMousedown, false);
  const onMouseup = () => {
    uniforms.u_mouse.value.setZ(0);
  };
  renderer.domElement.addEventListener("mouseup", onMouseup, false);

  animate();
})();
