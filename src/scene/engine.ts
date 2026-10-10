/*
 * A tiny software renderer that ray-marches a signed-distance-field CRT
 * television and rasterises it into two character layers:
 *   tone — soft shading, glass, stars and tethers (light grey)
 *   ink  — contour lines and on-screen text (dark grey)
 */

export const CAM_Z = 7;

// Screen glass placement in TV object space
const SX = -0.22;
const SY = 0.04;
const SW = 0.76;
const SH = 0.62;
const SCREEN_Z = 0.72;

// Bounding sphere around the whole set (object space)
const BC_Y = 0.6;
const BR = 2.3;

const TONE_RAMP = ".,:;=+*#%@";

const ID_BODY = 1;
const ID_SCREEN = 2;
const ID_KNOB = 3;
const ID_ANTENNA = 4;

export interface Point2 {
  x: number;
  y: number;
}

export interface Tether {
  from: Point2; // option position in px
  side: -1 | 0 | 1; // which side of the TV to attach to (0 = underneath)
}

export interface FrameState {
  width: number;
  height: number;
  cw: number; // char width px
  ch: number; // char height px
  time: number;
  yaw: number;
  pitch: number;
  bob: number;
  f: number; // focal length px
  cx: number; // projection centre px
  cy: number;
  power: number; // 0..1 crt warm-up
  reveal: number; // 0..1 assemble-in dissolve
  screen: string[]; // TH rows of TW chars
  tethers: Tether[];
  parallax: Point2; // -1..1 pointer
}

const clamp = (v: number, a: number, b: number) =>
  v < a ? a : v > b ? b : v;

function sdRoundBox(
  x: number,
  y: number,
  z: number,
  bx: number,
  by: number,
  bz: number,
  r: number,
) {
  const qx = Math.abs(x) - bx + r;
  const qy = Math.abs(y) - by + r;
  const qz = Math.abs(z) - bz + r;
  const mx = qx > 0 ? qx : 0;
  const my = qy > 0 ? qy : 0;
  const mz = qz > 0 ? qz : 0;
  return (
    Math.sqrt(mx * mx + my * my + mz * mz) +
    Math.min(Math.max(qx, Math.max(qy, qz)), 0) -
    r
  );
}

function sdCapsule(
  x: number,
  y: number,
  z: number,
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
  r: number,
) {
  const px = x - ax;
  const py = y - ay;
  const pz = z - az;
  const dx = bx - ax;
  const dy = by - ay;
  const dz = bz - az;
  const h = clamp((px * dx + py * dy + pz * dz) / (dx * dx + dy * dy + dz * dz), 0, 1);
  const ex = px - dx * h;
  const ey = py - dy * h;
  const ez = pz - dz * h;
  return Math.sqrt(ex * ex + ey * ey + ez * ez) - r;
}

function sdCylZ(x: number, y: number, z: number, r: number, h: number) {
  const dx = Math.sqrt(x * x + y * y) - r;
  const dz = Math.abs(z) - h;
  const ox = dx > 0 ? dx : 0;
  const oz = dz > 0 ? dz : 0;
  return Math.min(Math.max(dx, dz), 0) + Math.sqrt(ox * ox + oz * oz);
}

function sdSphere(x: number, y: number, z: number, r: number) {
  return Math.sqrt(x * x + y * y + z * z) - r;
}

let hitMat = 0;

function map(x: number, y: number, z: number, wantMat: boolean) {
  // cabinet: front shell + deep tube housing
  let d = sdRoundBox(x, y, z - 0.15, 1.25, 0.92, 0.55, 0.14);
  d = Math.min(d, sdRoundBox(x, y - 0.04, z + 0.62, 0.95, 0.7, 0.4, 0.22));
  // feet
  d = Math.min(d, sdRoundBox(Math.abs(x) - 0.82, y + 0.98, z - 0.3, 0.16, 0.08, 0.14, 0.04));
  // screen recess
  d = Math.max(d, -sdRoundBox(x - SX, y - SY, z - 0.74, 0.84, 0.7, 0.1, 0.12));
  let id = ID_BODY;

  // bulging glass
  const u = clamp((x - SX) / SW, -1, 1);
  const v = clamp((y - SY) / SH, -1, 1);
  const glass =
    sdRoundBox(x - SX, y - SY, z - 0.62, SW, SH, 0.06, 0.1) -
    0.06 * (1 - u * u) * (1 - v * v);
  if (glass < d) {
    d = glass;
    id = ID_SCREEN;
  }

  // dials
  const knob = Math.min(
    sdCylZ(x - 0.93, y - 0.42, z - 0.72, 0.15, 0.05),
    sdCylZ(x - 0.93, y - 0.04, z - 0.72, 0.11, 0.05),
  );
  if (knob < d) {
    d = knob;
    id = ID_KNOB;
  }

  // rabbit ears
  if (wantMat || y > 0.6) {
    let ant = sdSphere(x - 0.1, y - 0.92, z - 0.05, 0.24);
    ant = Math.min(ant, sdCapsule(x, y, z, 0.1, 1.05, 0.05, -0.78, 2.25, -0.15, 0.035));
    ant = Math.min(ant, sdCapsule(x, y, z, 0.1, 1.05, 0.05, 1.02, 2.05, 0.1, 0.035));
    ant = Math.min(ant, sdSphere(x + 0.78, y - 2.25, z + 0.15, 0.07));
    ant = Math.min(ant, sdSphere(x - 1.02, y - 2.05, z - 0.1, 0.07));
    if (ant < d) {
      d = ant;
      id = ID_ANTENNA;
    }
  } else {
    // everything up there sits above y = 0.68, so this bound stays conservative
    d = Math.min(d, 0.68 - y);
  }

  if (wantMat) hitMat = id;
  return d;
}

function hash(n: number) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

interface Star {
  x: number;
  y: number;
  z: number;
  twinkle: number;
  speed: number;
}

export class AsciiTV {
  private cols = 0;
  private rows = 0;
  private depth = new Float32Array(0);
  private mat = new Uint8Array(0);
  private nrm = new Float32Array(0);
  private tone: string[] = [];
  private ink: string[] = [];
  private stars: Star[] = [];

  constructor() {
    for (let i = 0; i < 220; i++) {
      this.stars.push({
        x: (hash(i + 0.1) - 0.5) * 22,
        y: (hash(i + 7.3) - 0.5) * 14,
        z: -12 + hash(i + 3.7) * 14,
        twinkle: hash(i + 9.9),
        speed: 0.5 + hash(i + 1.9),
      });
    }
  }

  /** Character dimensions of the screen texture at the current scale. */
  static screenSize(f: number, cw: number, ch: number) {
    const s = f / (CAM_Z - SCREEN_Z);
    return {
      tw: clamp(Math.round((s * SW * 2) / cw), 8, 96),
      th: clamp(Math.round((s * SH * 2) / ch), 4, 48),
    };
  }

  private resize(cols: number, rows: number) {
    if (cols === this.cols && rows === this.rows) return;
    this.cols = cols;
    this.rows = rows;
    const n = cols * rows;
    this.depth = new Float32Array(n);
    this.mat = new Uint8Array(n);
    this.nrm = new Float32Array(n * 3);
    this.tone = new Array(n);
    this.ink = new Array(n);
  }

  /** Project an object-space TV point into screen px. */
  projectObject(
    s: Pick<FrameState, "yaw" | "pitch" | "bob" | "f" | "cx" | "cy">,
    x: number,
    y: number,
    z: number,
  ): Point2 & { z: number } {
    const cy = Math.cos(s.yaw);
    const sy = Math.sin(s.yaw);
    const cp = Math.cos(s.pitch);
    const sp = Math.sin(s.pitch);
    const y1 = y * cp - z * sp;
    const z1 = y * sp + z * cp;
    const wx = x * cy + z1 * sy;
    const wz = -x * sy + z1 * cy;
    const wy = y1 + s.bob;
    const k = s.f / (CAM_Z - wz);
    return { x: s.cx + wx * k, y: s.cy - wy * k, z: wz };
  }

  render(s: FrameState): { tone: string; ink: string } {
    const cols = Math.max(1, Math.floor(s.width / s.cw));
    const rows = Math.max(1, Math.floor(s.height / s.ch));
    this.resize(cols, rows);
    const { depth, mat, nrm, tone, ink } = this;

    const cyw = Math.cos(s.yaw);
    const syw = Math.sin(s.yaw);
    const cp = Math.cos(s.pitch);
    const sp = Math.sin(s.pitch);

    // world -> object (inverse rotation): Ry(-yaw) then Rx(-pitch)
    const toObj = (x: number, y: number, z: number, out: number[]) => {
      const x1 = x * cyw - z * syw;
      const z1 = x * syw + z * cyw;
      out[0] = x1;
      out[1] = y * cp + z1 * sp;
      out[2] = -y * sp + z1 * cp;
    };
    // object -> world (normals)
    const toWorld = (x: number, y: number, z: number, out: number[]) => {
      const y1 = y * cp - z * sp;
      const z1 = y * sp + z * cp;
      out[0] = x * cyw + z1 * syw;
      out[1] = y1;
      out[2] = -x * syw + z1 * cyw;
    };

    const tmp = [0, 0, 0];
    const ro = [0, 0, 0];
    toObj(0, -s.bob, CAM_Z, ro);
    const ox = ro[0];
    const oy = ro[1];
    const oz = ro[2];

    // key light in object space
    const L = [-0.4, 0.5, 0.75];
    const ll = Math.hypot(L[0], L[1], L[2]);
    toObj(L[0] / ll, L[1] / ll, L[2] / ll, tmp);
    const lx = tmp[0];
    const ly = tmp[1];
    const lz = tmp[2];

    const { screen, time } = s;
    const th = screen.length;
    const tw = th ? screen[0].length : 0;
    const band = ((time * 0.11) % 1.4) - 0.2; // rolling scan band (0 top .. 1 bottom)

    for (let r = 0; r < rows; r++) {
      const py = (r + 0.5) * s.ch - s.cy;
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        tone[i] = " ";
        ink[i] = " ";
        depth[i] = Infinity;
        mat[i] = 0;

        const px = (c + 0.5) * s.cw - s.cx;
        let dx = px / s.f;
        let dy = -py / s.f;
        let dz = -1;
        const dl = Math.sqrt(dx * dx + dy * dy + 1);
        dx /= dl;
        dy /= dl;
        dz /= dl;
        toObj(dx, dy, dz, tmp);
        const rx = tmp[0];
        const ry = tmp[1];
        const rz = tmp[2];

        // bounding sphere
        const bx = ox;
        const by = oy - BC_Y;
        const bz = oz;
        const b = bx * rx + by * ry + bz * rz;
        const cc = bx * bx + by * by + bz * bz - BR * BR;
        const disc = b * b - cc;
        if (disc < 0) continue;
        const sq = Math.sqrt(disc);
        let t = Math.max(0, -b - sq);
        const tFar = -b + sq;

        let hit = false;
        for (let k = 0; k < 72 && t < tFar; k++) {
          const d = map(ox + rx * t, oy + ry * t, oz + rz * t, false);
          if (d < 0.0015 * t) {
            hit = true;
            break;
          }
          t += d * 0.85;
        }
        if (!hit) continue;

        const hx = ox + rx * t;
        const hy = oy + ry * t;
        const hz = oz + rz * t;
        map(hx, hy, hz, true);
        const id = hitMat;

        // tetrahedral normal
        const e = 0.002;
        const a = map(hx + e, hy - e, hz - e, false);
        const b2 = map(hx - e, hy - e, hz + e, false);
        const c2 = map(hx - e, hy + e, hz - e, false);
        const d2 = map(hx + e, hy + e, hz + e, false);
        let nx = a - b2 - c2 + d2;
        let ny = -a - b2 + c2 + d2;
        let nz = -a + b2 - c2 + d2;
        const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        nx /= nl;
        ny /= nl;
        nz /= nl;

        depth[i] = t;
        mat[i] = id;
        toWorld(nx, ny, nz, tmp);
        nrm[i * 3] = tmp[0];
        nrm[i * 3 + 1] = tmp[1];
        nrm[i * 3 + 2] = tmp[2];

        if (id === ID_SCREEN) {
          const u = clamp((hx - SX) / SW, -1, 1);
          const v = clamp((hy - SY) / SH, -1, 1);
          const vy = (1 - v) * 0.5; // 0 top .. 1 bottom
          const lit = Math.abs(v) < s.power;
          if (!lit) {
            tone[i] = Math.abs(v) < s.power + 0.04 ? "=" : ":";
            continue;
          }
          let tx = Math.floor((u + 1) * 0.5 * tw);
          const ty = Math.floor(vy * th);
          const inBand = Math.abs(vy - band) < 0.035;
          if (inBand) tx += 1;
          const glyph =
            tw && ty >= 0 && ty < th && tx >= 0 && tx < tw ? screen[ty][tx] : " ";
          if (glyph !== " " && s.power > 0.98) {
            ink[i] = glyph;
            continue;
          }
          const vig = u * u * u * u + v * v * v * v;
          const glare = u < -0.15 && v > 0.25 && Math.abs(u - v + 1.15) < 0.05;
          if (glare) tone[i] = "/";
          else if (inBand) tone[i] = "~";
          else if (vig > 0.7) tone[i] = ":";
          else if (vig > 0.45) tone[i] = ".";
          else if (hash(i * 0.37 + Math.floor(time * 12)) < 0.012) tone[i] = "`";
          continue;
        }

        // ambient occlusion (two taps)
        let occ = 0;
        occ += (0.06 - map(hx + nx * 0.06, hy + ny * 0.06, hz + nz * 0.06, false)) * 1.0;
        occ += (0.18 - map(hx + nx * 0.18, hy + ny * 0.18, hz + nz * 0.18, false)) * 0.5;
        const ao = clamp(1 - occ * 4, 0, 1);

        const diff = Math.max(0, nx * lx + ny * ly + nz * lz);
        const rim = 1 - Math.abs(nx * rx + ny * ry + nz * rz);
        let lum = 0.35 + 0.7 * diff * ao - rim * rim * 0.3;
        if (id === ID_ANTENNA) lum -= 0.35;
        if (id === ID_KNOB) lum -= 0.15;

        // speaker grille slots
        if (
          id === ID_BODY &&
          nz > 0.8 &&
          hx > 0.72 &&
          hx < 1.14 &&
          hy > -0.8 &&
          hy < -0.28
        ) {
          tone[i] = Math.floor((hy + 0.8) / 0.075) % 2 === 0 ? "=" : " ";
          continue;
        }

        const idx = clamp(
          Math.round((1 - clamp(lum, 0, 1)) * (TONE_RAMP.length - 1)),
          0,
          TONE_RAMP.length - 1,
        );
        tone[i] = TONE_RAMP[idx];
      }
    }

    this.contours();
    this.backdrop(s);

    // assemble-in dissolve
    if (s.reveal < 1) {
      for (let i = 0; i < tone.length; i++) {
        if (mat[i] && hash(i * 1.618) > s.reveal) {
          tone[i] = hash(i + time) < 0.1 * s.reveal ? "." : " ";
          ink[i] = " ";
        }
      }
    }

    return { tone: this.join(tone), ink: this.join(ink) };
  }

  /** Edge detection over depth / material / normal buffers. */
  private contours() {
    const { cols, rows, depth, mat, nrm, ink, tone } = this;
    const differs = (i: number, j: number) => {
      const mi = mat[i];
      const mj = mat[j];
      if (!mi && !mj) return false;
      if (!mi || !mj) return true;
      if (Math.abs(depth[i] - depth[j]) > 0.12) return depth[i] < depth[j];
      if (mi !== mj) return true;
      const dot =
        nrm[i * 3] * nrm[j * 3] +
        nrm[i * 3 + 1] * nrm[j * 3 + 1] +
        nrm[i * 3 + 2] * nrm[j * 3 + 2];
      return dot < 0.55;
    };

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        if (!mat[i] || ink[i] !== " ") continue;
        const ex =
          (c > 0 && differs(i, i - 1)) || (c < cols - 1 && differs(i, i + 1));
        const ey =
          (r > 0 && differs(i, i - cols)) ||
          (r < rows - 1 && differs(i, i + cols));
        if (!ex && !ey) continue;

        const nx = nrm[i * 3];
        const ny = nrm[i * 3 + 1];
        const nz = nrm[i * 3 + 2];
        let g: string;
        if (Math.abs(nz) > 0.8) {
          g = ex && ey ? "+" : ex ? "|" : "-";
        } else {
          const ax = Math.abs(nx);
          const ay = Math.abs(ny);
          if (ax > ay * 2.2) g = "|";
          else if (ay > ax * 2.2) g = ny < 0 ? "_" : "-";
          else g = nx * ny > 0 ? "\\" : "/";
        }
        ink[i] = g;
        tone[i] = " ";
      }
    }
  }

  /** Starfield and tethers, drawn only where the TV is not. */
  private backdrop(s: FrameState) {
    const { cols, rows, mat, tone, ink } = this;
    const put = (c: number, r: number, g: string) => {
      if (c < 0 || r < 0 || c >= cols || r >= rows) return;
      const i = r * cols + c;
      if (mat[i] || ink[i] !== " ") return;
      tone[i] = g;
    };

    for (const st of this.stars) {
      let x = st.x + s.time * 0.06 * st.speed;
      x = ((((x + 11) % 22) + 22) % 22) - 11;
      const dz = CAM_Z - st.z;
      const depthK = 1 / dz;
      const px = s.cx + (x * s.f) * depthK - s.parallax.x * 40 * depthK * 6;
      const py = s.cy - (st.y * s.f) * depthK - s.parallax.y * 24 * depthK * 6;
      const c = Math.floor(px / s.cw);
      const r = Math.floor(py / s.ch);
      let g = st.z > -3 ? "+" : st.z > -7 ? "." : "`";
      if (st.twinkle > 0.82) {
        const ph = Math.sin(s.time * (1.5 + st.speed) + st.twinkle * 40);
        g = ph > 0.6 ? "*" : ph > -0.2 ? "+" : ".";
      }
      put(c, r, g);
    }

    // tethers from channel options to the set
    for (const tether of s.tethers) {
      const anchor =
        tether.side === 0
          ? this.projectObject(s, tether.from.x > s.cx ? 0.5 : -0.5, -1.02, 0.3)
          : this.projectObject(s, tether.side * 1.25, 0.25 * -tether.side, 0.2);
      const fx = tether.from.x / s.cw;
      const fy = tether.from.y / s.ch;
      const ax = anchor.x / s.cw;
      const ay = anchor.y / s.ch;
      const steps = Math.ceil(Math.max(Math.abs(ax - fx), Math.abs(ay - fy)));
      const sag = Math.min(6, steps * 0.18);
      for (let k = 0; k <= steps; k++) {
        if (k % 2) continue;
        const u = k / Math.max(1, steps);
        const x = fx + (ax - fx) * u;
        const y = fy + (ay - fy) * u + sag * 4 * u * (1 - u);
        put(Math.round(x), Math.round(y), ".");
      }
    }
  }

  private join(buf: string[]) {
    const { cols, rows } = this;
    const out: string[] = new Array(rows);
    for (let r = 0; r < rows; r++) {
      out[r] = buf.slice(r * cols, (r + 1) * cols).join("");
    }
    return out.join("\n");
  }
}
