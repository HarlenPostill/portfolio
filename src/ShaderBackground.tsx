import { useEffect, useRef } from "react";
import { STRENGTH, STRENGTH_EVENT } from "./shaderStrength";

/*
 * Subtle, monotone animated background.
 * Domain-warped fractal noise, posterised into soft bands with faint contour
 * lines, pixelated across the screen with a slow second noise controlling how
 * strong the pixel effect is from place to place. Tinted only a few percent away from the page background so it never
 * competes with the content. Loads lazily and fades in once the first frame
 * has rendered.
 */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_bg;
uniform vec3 u_fg;
uniform float u_strength;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

// Domain-warped fractal noise: the slow, liquid base layer.
float field(vec2 uv, float t) {
  vec2 q = vec2(fbm(uv + vec2(0.0, t)), fbm(uv + vec2(5.2, 1.3) - t));
  vec2 r = vec2(
    fbm(uv + 3.0 * q + vec2(1.7, 9.2) + t * 1.3),
    fbm(uv + 3.0 * q + vec2(8.3, 2.8) - t * 0.9)
  );
  return fbm(uv + 3.0 * r);
}

// Posterised bands with thin contour lines.
float bandShade(float f) {
  float x = f * 7.0;
  float fx = fract(x);
  float level = (floor(x) + smoothstep(0.82, 1.0, fx)) / 7.0;
  float line = 1.0 - smoothstep(0.0, 0.05, min(fx, 1.0 - fx));
  return level * 0.75 + line * 0.35;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float T = u_time;
  float t = T * 0.035;

  // ── Pixel layer over the whole screen ────────────────────────
  float pc = 6.0; // pixel size in render px
  vec2 cellFrag = (floor(frag / pc) + 0.5) * pc;

  // A second, slower and larger noise decides how strong the pixel effect
  // is in each area: crisp blocks in some places, almost invisible in
  // others. Sampled per cell so its boundaries are stepped too.
  float tt = T * 0.018;
  float m = fbm(cellFrag / u_res.y * 0.9 + vec2(tt, -tt * 0.7) + 11.0);
  m = smoothstep(0.38, 0.68, m);

  // Only evaluate the layers that are actually visible.
  float pix = 0.0;
  float smoothShade = 0.0;
  if (m > 0.01) {
    float fc = field(cellFrag / u_res.y * 1.3, t);
    // Same bands and contour lines, sampled per cell, so the lines turn
    // into stepped pixel staircases. Stronger areas get a little more punch.
    pix = bandShade(fc) * (1.0 + 0.35 * m);
    // Per-cell tonal jitter: makes the blocks readable as a mosaic even
    // inside large flat bands. Scaled by intensity so calm areas stay calm.
    float jitter = hash(floor(frag / pc) + 17.0) - 0.5;
    pix += jitter * 0.22 * m;
  }
  if (m < 0.99) {
    smoothShade = bandShade(field(frag / u_res.y * 1.3, t));
  }
  float shade = mix(smoothShade, pix, m);

  // Soft vignette: the pattern fades out towards the screen edges.
  vec2 c = frag / u_res - 0.5;
  shade *= 1.0 - smoothstep(0.35, 0.9, length(c));

  vec3 col = mix(u_bg, u_fg, shade * u_strength);
  // A touch of grain hides any 8-bit banding.
  col += (hash(frag + fract(u_time)) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

const RENDER_SCALE = 0.5; // render at half resolution; it is soft anyway
const FPS = 30;
const START_DELAY = 900; // let the intro animation play first

const parseColor = (value: string): [number, number, number] => {
  const m = value.match(/[\d.]+/g);
  if (!m) return [0, 0, 0];
  return [+m[0] / 255, +m[1] / 255, +m[2] / 255];
};

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s) ?? "shader compile failed");
  }
  return s;
}

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    let raf = 0;
    let cancelled = false;
    let cleanup = () => {};

    const start = () => {
      if (cancelled) return;
      const gl = canvas.getContext("webgl", {
        antialias: false,
        alpha: false,
        powerPreference: "low-power",
        preserveDrawingBuffer: false,
      });
      if (!gl) return;

      let program: WebGLProgram;
      try {
        program = gl.createProgram()!;
        gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
        gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
      } catch {
        return;
      }
      gl.useProgram(program);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      );
      const loc = gl.getAttribLocation(program, "a_pos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const uRes = gl.getUniformLocation(program, "u_res");
      const uTime = gl.getUniformLocation(program, "u_time");
      const uBg = gl.getUniformLocation(program, "u_bg");
      const uFg = gl.getUniformLocation(program, "u_fg");
      const uStrength = gl.getUniformLocation(program, "u_strength");

      const applyTheme = () => {
        const styles = getComputedStyle(document.documentElement);
        const bg = parseColor(getComputedStyle(document.body).backgroundColor);
        const fg = parseColor(styles.getPropertyValue("color"));
        const isDark = bg[0] + bg[1] + bg[2] < 1.5;
        gl.uniform3fv(uBg, bg);
        gl.uniform3fv(uFg, fg);
        gl.uniform1f(uStrength, isDark ? STRENGTH.dark : STRENGTH.light);
      };
      applyTheme();

      const resize = () => {
        const w = Math.max(1, Math.round(window.innerWidth * RENDER_SCALE));
        const h = Math.max(1, Math.round(window.innerHeight * RENDER_SCALE));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          gl.viewport(0, 0, w, h);
          gl.uniform2f(uRes, w, h);
        }
      };
      resize();

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      // Random start time so every visit looks a little different.
      const t0 = performance.now() - Math.random() * 600_000;
      const draw = (now: number) => {
        gl.uniform1f(uTime, (now - t0) / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };

      let last = 0;
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (now - last < 1000 / FPS) return;
        last = now;
        draw(now);
      };

      // First frame, then reveal.
      draw(performance.now());
      requestAnimationFrame(() => canvas.classList.add("is-ready"));
      if (!reduceMotion) raf = requestAnimationFrame(loop);

      const onVisibility = () => {
        cancelAnimationFrame(raf);
        if (!document.hidden && !reduceMotion) raf = requestAnimationFrame(loop);
      };
      const redraw = () => {
        resize();
        applyTheme();
        draw(performance.now());
      };
      const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const themeObserver = new MutationObserver(() =>
        requestAnimationFrame(redraw),
      );
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      darkQuery.addEventListener("change", redraw);
      window.addEventListener("resize", redraw);
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener(STRENGTH_EVENT, redraw);

      cleanup = () => {
        themeObserver.disconnect();
        darkQuery.removeEventListener("change", redraw);
        window.removeEventListener("resize", redraw);
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener(STRENGTH_EVENT, redraw);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    };

    // Lazy start: after the intro, when the browser is idle.
    const timer = window.setTimeout(() => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(start, { timeout: 1500 });
      } else {
        start();
      }
    }, START_DELAY);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      cleanup();
    };
  }, []);

  return <canvas ref={canvasRef} className="shader-bg" aria-hidden="true" />;
}
