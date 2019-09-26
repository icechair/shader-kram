import vertexSource from "./vertex.js";
import fragmentSource from "./fragment.js";
/**
 *
 * @param {*} canvas // {HTMLCanvasElement} canvas
 */
function resize(canvas) {
  const dw = canvas.clientWidth;
  const dh = canvas.clientHeight;

  if (canvas.width != dw || canvas.height !== dh) {
    canvas.width = dw;
    canvas.height = dh;
  }
}
/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {number} type 
 * @param {string} source 
 */
function createShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    throw "couldnt compile shader"
  }
  return shader
}

/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {string} vSource 
 * @param {string} fSource 
 */
function createProgram(gl, vSource, fSource) {
  const program = gl.createProgram() 
  const vertex = createShader(gl, gl.VERTEX_SHADER, vSource)
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, fSource)
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    throw 'cannot link program'
  }
  return program
}

/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {WebGLProgram} program 
 * @param {WebGLBuffer}buffer
 * @param {number} start_time 
 */
function render(gl, program, buffer, start_time) {
  const time = new Date().getTime() - start_time
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.useProgram(program)
  gl.uniform1f(gl.getUniformLocation(program, "time"), time / 1000)
  gl.uniform2f(gl.getUniformLocation(program, 'resolution'), gl.canvas.width, gl.canvas.height)

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  var vertex_position = gl.getAttribLocation(program, "position")
  gl.vertexAttribPointer(vertex_position,2,gl.FLOAT,false, 0, 0)
  gl.enableVertexAttribArray(vertex_position)
  gl.drawArrays(gl.TRIANGLES, 0, 6)
  gl.disableVertexAttribArray(vertex_position)
}

function main() {
  /**
   * @type {HTMLCanvasElement}
   */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    throw "WebGL is missing";
  }

  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]),
    gl.STATIC_DRAW
  );

  const program = createProgram(gl, vertexSource, fragmentSource)
  var start_time = new Date().getTime()
  requestAnimationFrame(function loop(t) {
    resize(gl.canvas)
    render(gl, program, buffer, start_time)
    requestAnimationFrame(loop);
  });
}
window.onload = main