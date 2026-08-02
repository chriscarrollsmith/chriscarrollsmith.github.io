/**
 * The field: one persistent, deterministic noise field behind the whole home page.
 *
 * A single full-screen quad is drawn by a fragment shader doing domain-warped
 * fractal noise. Scroll position picks a palette along a five-stop ramp, so each
 * section reads as a different temperature of the same object rather than as a
 * different picture. Nothing here is random at runtime — the same scroll offset
 * always yields the same field.
 *
 * Cost control, in order of importance:
 *   - the backing store renders at half CSS resolution and is upscaled by the
 *     browser. The field is deliberately soft, so nothing is lost.
 *   - frames are capped to 30fps, and paused entirely when the tab is hidden.
 *   - machines with no usable GPU keep the static CSS gradient instead of
 *     burning CPU on a decoration. `failIfMajorPerformanceCaveat` alone does
 *     not achieve this — Chrome hands back a SwiftShader context regardless —
 *     so the renderer string is checked and the context dropped if it is
 *     software.
 *
 * Accessibility: the host element is `aria-hidden` and unfocusable, and
 * `prefers-reduced-motion` skips WebGL entirely. Output luminance is clamped to
 * a fixed band so the scrim over each section has a bounded worst case and
 * text contrast cannot drift below what was measured.
 */

import { FIELD_CHANNEL_MAX, FIELD_CHANNEL_MIN } from '../utils/fieldContrast';

const SECTION_IDS = ['home', 'about', 'projects', 'writing', 'events'] as const;

const RESOLUTION_SCALE = 0.5;
const MAX_BACKING_WIDTH = 1280;
const MAX_BACKING_HEIGHT = 800;
const FRAME_INTERVAL_MS = 1000 / 30;
/** Ignore deltas larger than this (tab was backgrounded) so the field never jumps. */
const MAX_FRAME_DELTA_MS = 250;
/** Per-frame easing toward the measured scroll/pointer targets. */
const SCROLL_EASING = 0.08;
const POINTER_EASING = 0.05;

const VERTEX_SHADER = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

#define FIELD_MIN ${FIELD_CHANNEL_MIN.toFixed(4)}
#define FIELD_MAX ${FIELD_CHANNEL_MAX.toFixed(4)}

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_scroll;
uniform vec2  u_pointer;

// Simplex noise, Ashima Arts / Stefan Gustavson (MIT).
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Four octaves is enough once the domain is warped; more just costs fill rate.
float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * snoise(p);
    p = p * 2.03 + vec2(17.3, 9.1);
    amp *= 0.42;
  }
  return sum;
}

// Five moods, one object. Each stop quotes the hero image it replaced:
// plum suit, gray motion blur, violet flowers, purple cityscape, putty wall.
vec3 rampDeep(float s) {
  vec3 c = vec3(0.082, 0.051, 0.121);
  c = mix(c, vec3(0.090, 0.113, 0.149), smoothstep(0.10, 0.30, s));
  c = mix(c, vec3(0.086, 0.051, 0.141), smoothstep(0.30, 0.50, s));
  c = mix(c, vec3(0.071, 0.059, 0.149), smoothstep(0.50, 0.70, s));
  c = mix(c, vec3(0.114, 0.102, 0.090), smoothstep(0.70, 0.90, s));
  return c;
}

vec3 rampGlow(float s) {
  vec3 c = vec3(0.290, 0.184, 0.369);
  c = mix(c, vec3(0.263, 0.337, 0.431), smoothstep(0.10, 0.30, s));
  c = mix(c, vec3(0.357, 0.184, 0.502), smoothstep(0.30, 0.50, s));
  c = mix(c, vec3(0.294, 0.227, 0.525), smoothstep(0.50, 0.70, s));
  c = mix(c, vec3(0.420, 0.380, 0.341), smoothstep(0.70, 0.90, s));
  return c;
}

void main() {
  vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

  // Scrolling translates the field rather than swapping it: you travel along
  // one continuous object instead of cutting between five backgrounds.
  vec2 p = st * 0.45 + vec2(0.0, u_scroll * 2.6);
  float t = u_time * 0.045;

  // Domain warping: noise displaced by noise displaced by noise. The two
  // intermediate lookups are what make this marble instead of clouds.
  vec2 q = vec2(fbm(p + vec2(0.0, t)),
                fbm(p + vec2(5.2, 1.3) - vec2(t, 0.0)));
  vec2 r = vec2(fbm(p + 1.8 * q + vec2(1.7, 9.2) + 0.15 * t),
                fbm(p + 1.8 * q + vec2(8.3, 2.8) - 0.12 * t));
  r += u_pointer * 0.20;

  float f = fbm(p + 1.6 * r);
  float v = clamp(0.5 + f * 0.325, 0.0, 1.0);

  vec3 col = mix(rampDeep(u_scroll), rampGlow(u_scroll), smoothstep(0.10, 0.92, v));
  col *= 1.0 - 0.30 * dot(st, st);

  // Pull overall brightness into the band, then clamp per channel so no single
  // channel can escape it. Section scrims are tuned against these two extremes,
  // so contrast ratios hold on every frame rather than on the sampled one.
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col *= clamp(luma, 0.05, 0.52) / max(luma, 1e-4);
  col = clamp(col, vec3(FIELD_MIN), vec3(FIELD_MAX));

  // Ordered-ish dither: gradients this shallow band badly in 8-bit.
  float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (dither - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`;

type Uniforms = {
  resolution: WebGLUniformLocation | null;
  time: WebGLUniformLocation | null;
  scroll: WebGLUniformLocation | null;
  pointer: WebGLUniformLocation | null;
};

const compile = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

/**
 * True when the context is backed by a CPU rasterizer rather than a GPU.
 *
 * `failIfMajorPerformanceCaveat` is documented to prevent this, but Chrome
 * still returns a SwiftShader context, so the renderer has to be inspected
 * after the fact. Browsers that withhold `WEBGL_debug_renderer_info` (Safari,
 * Firefox with resistFingerprinting) report nothing conclusive; those are
 * treated as hardware, since guessing the other way would disable the field
 * for people who can perfectly well run it.
 */
const isSoftwareRenderer = (gl: WebGLRenderingContext): boolean => {
  let renderer = '';
  try {
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    renderer = String(
      (info && gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) || gl.getParameter(gl.RENDERER) || '',
    );
  } catch {
    return false;
  }
  return /swiftshader|llvmpipe|lavapipe|softpipe|software|basic render/i.test(renderer);
};

const buildProgram = (gl: WebGLRenderingContext): WebGLProgram | null => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  // Shaders are reference-counted by the program; drop our handles either way.
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
};

const start = (): void => {
  const host = document.querySelector<HTMLElement>('[data-site-field]');
  const canvas = host?.querySelector<HTMLCanvasElement>('[data-site-field-canvas]');
  if (!host || !canvas) return;

  // Reduced motion keeps the static CSS gradient the host already paints.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let gl: WebGLRenderingContext | null = null;
  try {
    gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
      // Asks for the same thing isSoftwareRenderer enforces; honored by some
      // browsers, ignored by Chrome, harmless where it is respected.
      failIfMajorPerformanceCaveat: true,
    }) as WebGLRenderingContext | null;
  } catch {
    gl = null;
  }
  if (!gl) return;

  if (isSoftwareRenderer(gl)) {
    // Hand the context straight back; the CSS gradient is the better trade.
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return;
  }

  const program = buildProgram(gl);
  if (!program) return;

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  // One oversized triangle covers the viewport with fewer vertices than a quad.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  gl.useProgram(program);
  const position = gl.getAttribLocation(program, 'a_pos');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniforms: Uniforms = {
    resolution: gl.getUniformLocation(program, 'u_resolution'),
    time: gl.getUniformLocation(program, 'u_time'),
    scroll: gl.getUniformLocation(program, 'u_scroll'),
    pointer: gl.getUniformLocation(program, 'u_pointer'),
  };

  let width = 0;
  let height = 0;

  const resize = () => {
    const cssWidth = Math.max(window.innerWidth, 1);
    const cssHeight = Math.max(window.innerHeight, 1);
    // One scale factor for both axes: capping them independently would stretch
    // the noise, and the upscale to viewport size would make it obvious.
    const scale = Math.min(
      Math.min(window.devicePixelRatio || 1, 2) * RESOLUTION_SCALE,
      MAX_BACKING_WIDTH / cssWidth,
      MAX_BACKING_HEIGHT / cssHeight,
    );
    const next = {
      w: Math.max(2, Math.round(cssWidth * scale)),
      h: Math.max(2, Math.round(cssHeight * scale)),
    };
    if (next.w === width && next.h === height) return;
    width = next.w;
    height = next.h;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    gl.uniform2f(uniforms.resolution, width, height);
  };

  /**
   * Where the viewport sits along the run of sections, as 0..1.
   *
   * Sections are measured rather than assumed: `Writing` and `Events` hydrate
   * with `client:only`, so the document keeps growing for a beat after load,
   * and the home page's sections are nowhere near equal height. Measuring keeps
   * each palette stop centered on the section it belongs to.
   */
  /** Document offset of each section that exists, paired with its ramp index. */
  let stops: { top: number; index: number }[] = [];
  let documentEnd = 0;

  const measure = () => {
    const scrollY = window.scrollY;
    stops = SECTION_IDS.map((id, index) => {
      const el = document.getElementById(id);
      return el ? { top: el.getBoundingClientRect().top + scrollY, index } : null;
    }).filter((stop): stop is { top: number; index: number } => stop !== null);
    documentEnd = Math.max(document.documentElement.scrollHeight, window.innerHeight);
  };

  const readScroll = (): number => {
    if (stops.length === 0) return 0;

    const focus = window.scrollY + window.innerHeight * 0.5;
    const span = 1 / SECTION_IDS.length;

    for (let i = 0; i < stops.length; i++) {
      const current = stops[i];
      if (focus < current.top) break;
      const nextTop = i + 1 < stops.length ? stops[i + 1].top : documentEnd;
      if (focus < nextTop) {
        const reach = Math.max(nextTop - current.top, 1);
        const within = Math.min((focus - current.top) / reach, 1);
        // Sections are unequal in height, so each one is normalized to its own
        // equal slice of the ramp; the field advances per section, not per pixel.
        return (current.index + within) * span;
      }
    }
    return focus < stops[0].top ? stops[0].index * span : 1;
  };

  let scroll = 0;
  let scrollTarget = 0;
  let pointerX = 0;
  let pointerY = 0;
  let pointerTargetX = 0;
  let pointerTargetY = 0;
  let elapsed = 0;
  let previous = 0;
  let sinceFrame = FRAME_INTERVAL_MS;
  let frame = 0;
  let live = false;
  let running = false;

  const render = (now: number) => {
    frame = window.requestAnimationFrame(render);

    const delta = previous === 0 ? FRAME_INTERVAL_MS : Math.min(now - previous, MAX_FRAME_DELTA_MS);
    previous = now;
    sinceFrame += delta;
    if (sinceFrame < FRAME_INTERVAL_MS) return;
    sinceFrame = 0;

    elapsed += delta / 1000;
    scroll += (scrollTarget - scroll) * SCROLL_EASING;
    pointerX += (pointerTargetX - pointerX) * POINTER_EASING;
    pointerY += (pointerTargetY - pointerY) * POINTER_EASING;

    gl.uniform1f(uniforms.time, elapsed);
    gl.uniform1f(uniforms.scroll, scroll);
    gl.uniform2f(uniforms.pointer, pointerX, pointerY);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!live) {
      live = true;
      canvas.classList.add('is-live');
    }
  };

  const play = () => {
    if (running) return;
    running = true;
    previous = 0;
    frame = window.requestAnimationFrame(render);
  };

  const pause = () => {
    if (!running) return;
    running = false;
    window.cancelAnimationFrame(frame);
  };

  const onScroll = () => {
    scrollTarget = readScroll();
  };

  const onResize = () => {
    resize();
    measure();
    onScroll();
  };

  canvas.addEventListener(
    'webglcontextlost',
    (event) => {
      // Keep the browser from spilling a console error, and let the CSS
      // gradient underneath stand in for the rest of the visit.
      event.preventDefault();
      pause();
      canvas.classList.remove('is-live');
    },
    { passive: false }
  );

  resize();
  measure();
  scrollTarget = readScroll();
  scroll = scrollTarget;

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
    else play();
  });

  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener(
      'pointermove',
      (event) => {
        pointerTargetX = (event.clientX / window.innerWidth) * 2 - 1;
        pointerTargetY = 1 - (event.clientY / window.innerHeight) * 2;
      },
      { passive: true }
    );
  }

  window.addEventListener('load', onResize);

  // Writing and Events hydrate with client:only, so the first layout is missing
  // two of the five sections and the document is far shorter than it will be.
  // A ResizeObserver is the obvious tool and the wrong one here: App.css pins
  // `html, body { height: 100% }`, so body's box stays viewport-sized no matter
  // how much content lands inside it, and the callback never fires. Poll the
  // document height instead until it settles with every section accounted for.
  const settle = window.setInterval(() => {
    if (
      stops.length < SECTION_IDS.length ||
      documentEnd !== Math.max(document.documentElement.scrollHeight, window.innerHeight)
    ) {
      measure();
      onScroll();
    }
  }, 200);
  window.setTimeout(() => window.clearInterval(settle), 10000);

  play();
};

start();
