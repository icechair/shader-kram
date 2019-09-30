//#extension GL_EXT_gpu_shader5 : require

precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform vec2 mouse;

struct ray {
    vec3 o, d;
};

float N(float t) {
    return fract(sin(t * 4532.) *2342.);
}

vec4 N14(float t) {
    return fract(sin(t * vec4(223., 2344., 4564., 9912.)) * vec4(2342., 123., 4445., 626.));
}

ray GetRay(vec2 uv, vec3 camera, vec3 lookat, float zoom) {
    ray a; 
    a.o = camera;
    vec3 f = normalize(lookat - camera);
    vec3 r = cross(vec3(0, 1, 0), f);
    vec3 u = cross(f, r);
    vec3 c = a.o + f * zoom;
    vec3 i = c + uv.x * r + uv.y * u;

    a.d = normalize(i - a.o);
    return a;
}

vec3 ClosestPoint(ray r, vec3 p) {
    return r.o + max(0., dot(p-r.o, r.d)) * r.d;
}

float DistanceRay(ray r, vec3 p) {
    return length(p - ClosestPoint(r, p));
}

float Bokeh(ray r, vec3 p, float size, float blur) {
    float d = DistanceRay(r, p);
    size *= length(p);
    float c = smoothstep(size, size * (1. - blur), d);
    c *= mix(.6, 1., smoothstep(size * .8, size, d));
    return c;
}

vec3 StreetLights(ray r, float t) {
    const float s = 1./10.;
    float side = step(r.d.x, 0.);
    //mirror the space
    r.d.x = abs(r.d.x);
    float mask = 0.;
    for(float i = 0.; i < 1.; i += s) {
        float ti = fract(t + i + side * s * .5);
        float z =  100. - ti * 100.;
        float fade = ti * ti * ti;
        
        vec3 p = vec3(2., 2., z);
        mask += Bokeh(r, p, .05, .1) * fade;
    }
    return vec3(1., .7, .3) * mask;
}

vec3 EnvironmentLights(ray r, float t) {
    const float s = 1./10.;
    float side = step(r.d.x, 0.);
    //mirror the space
    r.d.x = abs(r.d.x);
    vec3 col = vec3(0.);
    for(float i = 0.; i < 1.; i += s) {
        vec4 n = N14(i + side * 100.);
        float ti = fract(t + i + side * s * .5);
        float x = mix(2.5, 10., n.x);
        float y = mix(.1, 1.5, n.y);
        float z =  50. - ti * 50.;
        float fade = ti * ti * ti;
        float occlusion = sin(ti * 6.28 * 10. * n.x) * .5 + .5;
        fade = occlusion;
        vec3 base = n.wzy;
        col += Bokeh(r, vec3(x, y, z), .05, .1) * fade * base * .5;
    }
    return col;
}


vec3 HeadLights(ray r, float t) {
    t *= 2.;
    float w1 = 0.25;
    float w2 = w1 * 1.2;
    const float s = 1./30.;
    float mask = 0.;

    for(float i = 0.; i < 1.; i += s) {
        float n = N(i);
        if (n > .1) {
            continue;
        }
        float ti = fract(t + i);
        float x = -1.;
        float y = -.15;
        float z = 100. - ti * 100.;
        float fade = ti * ti * ti * ti * ti;
        float focus = smoothstep(.9, 1., ti);
        float size = mix(.05, .03, focus);

        mask += Bokeh(r, vec3(x - w1, y, z), size, .1) * fade;
        mask += Bokeh(r, vec3(x + w1, y, z), size, .1) * fade;

        mask += Bokeh(r, vec3(x - w2, y, z), size, .1) * fade;
        mask += Bokeh(r, vec3(x + w2, y, z), size, .1) * fade;

        float ref = 0.;
        ref += Bokeh(r, vec3(x - w2, y-.1, z), size * 3., 1.) * fade;
        ref += Bokeh(r, vec3(x + w2, y-.1, z), size * 3., 1.) * fade;
        mask += ref * focus;
    }
    return vec3(.9, .9, 1.) * mask;
}

vec3 TailLights(ray r, float t) {
    t *= .25;
    float w1 = 0.25;
    float w2 = w1 * 1.2;
    const float s = 1./30.;
    float mask = 0.;

    for(float i = 0.; i < 1.; i += s) {
        float n = N(i);
        if (n > .5) {
            continue;
        }
        float ti = fract(t + i);
        float lane = step(.25, n);
        float laneShift = smoothstep(.999, .96, ti);
        float x = 1.5 - lane * laneShift;
        float y = -.15;
        float z = 100. - ti * 100.;
        float fade = ti * ti * ti * ti * ti;
        float focus = smoothstep(.9, 1., ti);
        float size = mix(.05, .03, focus);
        float blink = step(0., sin(t*500.)) * 7. * lane * step(.958, ti);
        mask += Bokeh(r, vec3(x - w1, y, z), size, .1) * fade;
        mask += Bokeh(r, vec3(x + w1, y, z), size, .1) * fade;

        mask += Bokeh(r, vec3(x - w2, y, z), size, .1) * fade;
        mask += Bokeh(r, vec3(x + w2, y, z), size, .1) * fade * (1. + blink);

        float ref = 0.;
        ref += Bokeh(r, vec3(x - w2, y - .1, z), size * 3., 1.) * fade;
        ref += Bokeh(r, vec3(x + w2, y - .1, z), size * 3., 1.) * fade * (1. + blink * 0.1);
        mask += ref * focus;
    }
    return vec3(1., .1, .03) * mask;
}

vec2 Rain(vec2 uv, float t) {
    t *= 40.;
    vec2 a = vec2(3., 1.);
    vec2 st = uv * a;
    vec2 id = floor(st);

    st.y += t * .22;
    float n = N(id.x*596.818);
    st.y += n;
    uv.y += n;
    id = floor(st);
    st = fract(st) - .5;

    t += fract(sin(id.x * 761.34 + id.y * 153.7) * 76.34) * 6.283;
    float y = -sin(t + sin(t + sin(t) * .5)) * .43;
    vec2 p1 = vec2(0., y);
    vec2 o1 = (st-p1)/a;
    float d = length(o1);

    float m1 = smoothstep(.07, .0, d);
    vec2 o2 = (fract(uv * a.x * vec2(1., 2.)) - .5) / vec2(1., 2.);
    d = length(o2);

    float m2 = smoothstep(.25 * (.5 - st.y), .0, d) * smoothstep(-.1, .1, st.y - p1.y);
    //if(st.x > .46 || st.y  > .49) m1 = 1.;
    return vec2(m1 * o1 * 20. + m2 * o2 * 10.);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    uv -= .5;
    uv.x *= resolution.x /resolution.y;

    vec2 control = mouse.xy / resolution.xy;
    float t = time * .05; // + control.x;

    vec3 camera = vec3(.5, 0.01, 0.);
    vec3 lookat = vec3(.5, 0.01, 1.);
    
    vec2 rainDistortion = Rain(uv * 5., t) * .5;
    rainDistortion += Rain(uv * 7., t) * .5;

    uv.x += sin(uv.y * 70.) * .005;
    uv.y += sin(uv.x * 170.) * .003;
    ray r = GetRay(uv - rainDistortion*.5, camera, lookat, 1.);
    
    
    vec3 color = StreetLights(r, t);
    color += HeadLights(r, t);
    color += TailLights(r, t);
    color += EnvironmentLights(r, t);
    color += (r.d.y+.1) * vec3(.2, .1, .5);

    //color = vec3(rainDistortion.xy, 0.);
    gl_FragColor = vec4(color, 1.);
}