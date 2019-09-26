import {frag} from './lib/helper.js'

export default frag`
#ifdef GL_ES
precision highp float;
#endif
uniform float time;
uniform vec2 resolution;

float sphereSDF(vec3 p, float size) {
    return length(p) - size;
}

float boxSDF(vec3 p, vec3 b) {
    vec3 d = abs(p) -b;
    
    return length(max(d, 0.0)) + min(max(d.x, max(d.y,d.z)), 0.0);
}

float sceneSDF(in vec3 p) {
    return boxSDF(p, vec3(.5,1.0,1.5));
}

vec3 calculate_normal(in vec3 p)
{
    const vec3 small_step = vec3(0.001, 0.0, 0.0);

    float gradient_x = sceneSDF(p + small_step.xyy) - sceneSDF(p - small_step.xyy);
    float gradient_y = sceneSDF(p + small_step.yxy) - sceneSDF(p - small_step.yxy);
    float gradient_z = sceneSDF(p + small_step.yyx) - sceneSDF(p - small_step.yyx);

    vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

    return normalize(normal);
}

vec3 raymarch(in vec3 ro, in vec3 rd) {
    float traveled = 0.0;
    const int N_STEPS = 32;
    const float MIN_HIT = 0.001;
    const float MAX_TRACE = 1000.0;

    for(int i = 0; i < N_STEPS; i++) {
        vec3 currentPosition = ro + traveled * rd;
        float closest = sceneSDF(currentPosition);
        if (closest < MIN_HIT) {
            vec3 normal = calculate_normal(currentPosition);

            vec3 light = vec3(2.0, -5.0, 3.0);
            vec3 lightDirection = normalize(currentPosition - light);
            float diffuse = max(0.0, dot(normal, lightDirection));

            return (normal * 0.5 + 0.5) * diffuse;
        }

        if(traveled > MAX_TRACE) {
            break;
        }
        traveled += closest;
    }
    return vec3(0.0);
}
mat4 viewMatrix(vec3 eye, vec3 center, vec3 up) {
	vec3 f = normalize(center - eye);
	vec3 s = normalize(cross(f, up));
	vec3 u = cross(s, f);
	return mat4(
		vec4(s, 0.0),
		vec4(u, 0.0),
		vec4(-f, 0.0),
		vec4(0.0, 0.0, 0.0, 1)
	);
}

void main () {
    /*
    vec2 position = - 1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
    float red = abs(sin(position.x * position.y + time / 5.0));
    float green = abs(sin(position.x * position.y + time / 4.0));
    float blue = abs(sin(position.x * position.y + time / 3.0));

    gl_FragColor = vec4(red, green, blue, 1.0);
    */

    vec2 uv = (gl_FragCoord.xy / resolution.xy) - .5;
    vec3 camera = vec3(0.0, 0.0, -5.0);
    vec3 ro = camera;
    vec3 rd = vec3(uv, 1.0);
    vec3 march = raymarch(ro, rd);
    vec4 col = vec4(march, 1.0);
    gl_FragColor = col;
}
`