import "./twgl/4.x/twgl.js"

/**
 *
 * @param {WebGL2RenderingContext} gl
 * @param {twgl.ProgramInfo} pInfo
 * @param {twgl.BufferInfo} bInfo
 * @param {{x:number,y:number}} mouse
 */
function Render(gl, pInfo, bInfo, mouse) {
  const fn = t => {
    twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    const uniforms = {
      time: t * 0.001,
      resolution: [gl.canvas.width, gl.canvas.height],
      mouse: [mouse.x, mouse.y]
    }
    gl.useProgram(pInfo.program)
    twgl.setBuffersAndAttributes(gl, pInfo, bInfo)
    twgl.setUniforms(pInfo, uniforms)
    twgl.drawBufferInfo(gl, bInfo)
    requestAnimationFrame(fn)
  }
  return fn
}

/**
 *
 * @param {string} url
 */
async function getText(url) {
  try {
    const response = await fetch(url)
    if (response.ok) {
      return response.text()
    }
  } catch (e) {}
  return ""
}

async function main() {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.querySelector("#canvas")
  const gl = canvas.getContext("webgl2")
  if (!gl) {
    return alert("coudnt get webgl context")
  }
  const [vs, fs] = await Promise.all([
    getText(window.location.href + "shader.vert"),
    getText(window.location.href + "shader.frag")
  ])
  console.log(Object.getOwnPropertyNames(twgl))

  const pInfo = twgl.createProgramInfo(gl, [vs, fs])
  const arrays = {
    position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]
  }
  const bInfo = twgl.createBufferInfoFromArrays(gl, arrays)

  const mouse = { x: 0, y: 0 }
  canvas.addEventListener("mousemove", e => {
    const rect = e.target.getBoundingClientRect()
    mouse.x = e.clientX - rect.left
    mouse.y = e.clientY - rect.top
  })
  const render = Render(gl, pInfo, bInfo, mouse)
  requestAnimationFrame(render)
}

window.onload = main
