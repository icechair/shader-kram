//#extension GL_EXT_gpu_shader5 : require

precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_mouse;
uniform float u_frame;


void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 m = u_mouse.xy / u_resolution;
    // gl_FragColor = vec4(m, 0.0, 1.);
    gl_FragColor = vec4(uv*m, 0.0, 1.);
    return;

}