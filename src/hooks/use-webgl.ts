import { useRef, useEffect, useState } from "react";
import { createNoiseTexture } from "@/lib/noise-texture";

type UniformValue =
  | number
  | [number, number]
  | [number, number, number]
  | [number, number, number, number];
type UniformSetter = (
  gl: WebGL2RenderingContext,
  loc: WebGLUniformLocation,
  val: UniformValue
) => void;

interface CachedUniform {
  loc: WebGLUniformLocation;
  setter: UniformSetter;
}

interface UseWebGLOptions {
  fragmentShader: string;
  uniforms: Record<string, UniformValue>;
  onError?: () => void;
  renderScale?: number;
  noiseSeed?: number;
  noiseSize?: number;
}

type WebGLStatus = "idle" | "running" | "error";

const VERT = `#version 300 es
in vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

const BLIT_FRAG = `#version 300 es
precision mediump float;
uniform sampler2D u_tex;
uniform vec2 u_size;
out vec4 outColor;
void main() {
  outColor = texture(u_tex, gl_FragCoord.xy / u_size);
}
`;

const QUAD = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

const set1f: UniformSetter = (gl, loc, v) => gl.uniform1f(loc, v as number);
const set2f: UniformSetter = (gl, loc, v) => {
  const a = v as [number, number];
  gl.uniform2f(loc, a[0], a[1]);
};
const set3f: UniformSetter = (gl, loc, v) => {
  const a = v as [number, number, number];
  gl.uniform3f(loc, a[0], a[1], a[2]);
};
const set4f: UniformSetter = (gl, loc, v) => {
  const a = v as [number, number, number, number];
  gl.uniform4f(loc, a[0], a[1], a[2], a[3]);
};

function getSetter(val: UniformValue): UniformSetter {
  if (typeof val === "number") return set1f;
  if (val.length === 2) return set2f;
  if (val.length === 3) return set3f;
  return set4f;
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  src: string
): WebGLShader | null {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function linkProgram(
  gl: WebGL2RenderingContext,
  vs: WebGLShader,
  fs: WebGLShader
): WebGLProgram | null {
  const p = gl.createProgram();
  if (!p) return null;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    gl.deleteProgram(p);
    return null;
  }
  return p;
}

function upgradeShader(src: string): string {
  if (src.trimStart().startsWith("#version")) return src;
  let s = src
    .replace(/\bgl_FragColor\b/g, "outColor")
    .replace(/\btexture2D\b/g, "texture");
  s = s.replace(/^\s*precision\s+(highp|mediump|lowp)\s+float\s*;/m, "");
  return "#version 300 es\nprecision highp float;\nout vec4 outColor;\n" + s;
}

export function useWebGL({
  fragmentShader,
  uniforms,
  onError,
  renderScale = 0.5,
  noiseSeed = 42,
  noiseSize = 256,
}: UseWebGLOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<WebGLStatus>("idle");
  const uniformsRef = useRef(uniforms);
  uniformsRef.current = uniforms;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "default",
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      setStatus("error");
      onError?.();
      return;
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const fs = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      upgradeShader(fragmentShader)
    );
    if (!vs || !fs) {
      setStatus("error");
      onError?.();
      return;
    }

    const program = linkProgram(gl, vs, fs);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!program) {
      setStatus("error");
      onError?.();
      return;
    }

    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const noiseTex = createNoiseTexture(gl, noiseSize, noiseSeed);
    const noiseTexLoc = gl.getUniformLocation(program, "u_noise");

    const iResLoc = gl.getUniformLocation(program, "iResolution");
    const iTimeLoc = gl.getUniformLocation(program, "iTime");

    const cachedUniforms: CachedUniform[] = [];
    const uniformKeys: string[] = [];
    const initU = uniformsRef.current;
    for (const key in initU) {
      const loc = gl.getUniformLocation(program, key);
      if (loc) {
        cachedUniforms.push({ loc, setter: getSetter(initU[key]) });
        uniformKeys.push(key);
      }
    }

    const scale = Math.max(0.25, Math.min(1.0, renderScale));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const useFBO = scale < 1.0;

    let fboTex: WebGLTexture | null = null;
    let fbo: WebGLFramebuffer | null = null;
    let blitProg: WebGLProgram | null = null;
    let blitTexLoc: WebGLUniformLocation | null = null;
    let blitSizeLoc: WebGLUniformLocation | null = null;

    if (useFBO) {
      const bvs = compileShader(gl, gl.VERTEX_SHADER, VERT);
      const bfs = compileShader(gl, gl.FRAGMENT_SHADER, BLIT_FRAG);
      if (bvs && bfs) {
        blitProg = linkProgram(gl, bvs, bfs);
        gl.deleteShader(bvs);
        gl.deleteShader(bfs);
        if (blitProg) {
          blitTexLoc = gl.getUniformLocation(blitProg, "u_tex");
          blitSizeLoc = gl.getUniformLocation(blitProg, "u_size");
        }
      }
      fboTex = gl.createTexture();
      if (fboTex) {
        gl.bindTexture(gl.TEXTURE_2D, fboTex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      }
      fbo = gl.createFramebuffer();
    }

    let renderW = 0,
      renderH = 0,
      displayW = 0,
      displayH = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);

      if (
        displayW > 0 &&
        w === displayW &&
        Math.abs(h - displayH) < displayH * 0.3
      ) {
        return;
      }

      displayW = w;
      displayH = h;
      canvas.width = w;
      canvas.height = h;

      if (useFBO && fbo && fboTex) {
        renderW = Math.max(1, Math.round(w * scale));
        renderH = Math.max(1, Math.round(h * scale));
        gl.bindTexture(gl.TEXTURE_2D, fboTex);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA8,
          renderW,
          renderH,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          null
        );
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          gl.TEXTURE_2D,
          fboTex,
          0
        );
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        renderW = w;
        renderH = h;
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const t0 = performance.now();
    let raf = 0;
    let alive = true;
    setStatus("running");

    const render = (now: number) => {
      if (!alive) return;

      const t = (now - t0) * 0.001;

      if (useFBO && fbo) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      }
      gl.viewport(0, 0, renderW, renderH);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      if (noiseTex && noiseTexLoc) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, noiseTex);
        gl.uniform1i(noiseTexLoc, 0);
      }

      if (iResLoc) gl.uniform2f(iResLoc, renderW, renderH);
      if (iTimeLoc) gl.uniform1f(iTimeLoc, t);

      const u = uniformsRef.current;
      for (let i = 0; i < cachedUniforms.length; i++) {
        let val = u[uniformKeys[i]];

        if (uniformKeys[i] === "u_scrollY" && typeof val === "number") {
          val = val * dpr;
        }

        cachedUniforms[i].setter(gl, cachedUniforms[i].loc, val);
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (useFBO && blitProg && fboTex) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, displayW, displayH);
        gl.useProgram(blitProg);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, fboTex);
        if (blitTexLoc) gl.uniform1i(blitTexLoc, 1);
        if (blitSizeLoc) gl.uniform2f(blitSizeLoc, displayW, displayH);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      if (noiseTex) gl.deleteTexture(noiseTex);
      if (fbo) gl.deleteFramebuffer(fbo);
      if (fboTex) gl.deleteTexture(fboTex);
      if (blitProg) gl.deleteProgram(blitProg);
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
    };
  }, [fragmentShader, renderScale, noiseSeed, noiseSize, onError]);

  return { canvasRef, status };
}
