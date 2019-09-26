import {vert} from './lib/helper.js'

export default vert`
attribute vec3 position;
void main() {
    gl_Position = vec4(position, 1.0);
}
`