import { useEffect, useRef, useState } from "react";
import { channels, channelById, type Channel } from "../content";
import { AsciiTV, CAM_Z, type Tether } from "./engine";
import { composeScreen } from "./screen";

const MOBILE_BREAKPOINT = 720;
const FRAME_MS = 1000 / 30;
const HEADER = 76;
const FOOTER = 44;

type Vec3 = [number, number, number];

// Where each channel floats in world space
const ANCHORS: Record<"desktop" | "mobile", Vec3[]> = {
  desktop: [
    [-2.95, 1.2, 0.6],
    [3.0, 0.5, 0.4],
    [-2.5, -1.3, 0.9],
    [2.75, -1.45, 0.7],
  ],
  mobile: [
    [-1.0, -1.75, 0.6],
    [1.0, -2.05, 0.6],
    [-0.95, -2.75, 0.6],
    [1.05, -3.05, 0.6],
  ],
};

// World-space bounds the camera frames: [minX, maxX, minY, maxY]
const BOUNDS = {
  desktop: [-3.7, 3.7, -1.75, 2.45],
  mobile: [-1.75, 1.75, -3.5, 2.45],
};

const NOISE = "#%@*+=-:. ";

function boxLabel(number: string, label: string) {
  const text = ` ${number} ${label.toUpperCase()} `;
  const bar = "-".repeat(text.length);
  return `+${bar}+\n|${text}|\n+${bar}+`;
}

interface Props {
  active?: Channel;
  panelOpen: boolean;
  onSelect: (channel: Channel) => void;
}

export default function AsciiScene({ active, panelOpen, onSelect }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const toneRef = useRef<HTMLPreElement>(null);
  const inkRef = useRef<HTMLPreElement>(null);
  const probeRef = useRef<HTMLPreElement>(null);
  const hudRef = useRef<HTMLSpanElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [hovered, setHovered] = useState<Channel | undefined>();

  // Values the render loop reads without re-subscribing
  const live = useRef({ active, hovered, panelOpen });
  useEffect(() => {
    live.current = { active, hovered, panelOpen };
  }, [active, hovered, panelOpen]);

  const tunedAt = useRef(0);
  const tuned = hovered ?? active;
  useEffect(() => {
    tunedAt.current = performance.now();
  }, [tuned]);

  useEffect(() => {
    const root = rootRef.current!;
    const tonePre = toneRef.current!;
    const inkPre = inkRef.current!;
    const probe = probeRef.current!;
    const tv = new AsciiTV();
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let cw = 7;
    let ch = 14;
    const measure = () => {
      const r = probe.getBoundingClientRect();
      cw = r.width / 20 || cw;
      ch = r.height / 10 || ch;
    };
    measure();
    document.fonts?.ready.then(measure);
    let frames = 0;

    let width = root.clientWidth;
    let height = root.clientHeight;
    const ro = new ResizeObserver(() => {
      width = root.clientWidth;
      height = root.clientHeight;
      measure();
    });
    ro.observe(root);

    // camera + motion state
    const cam = { f: 0, cx: width / 2, cy: height / 2 };
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const drag = {
      on: false,
      id: -1,
      lastX: 0,
      lastY: 0,
      yaw: 0,
      pitch: 0,
      vYaw: 0,
    };
    let yaw = 0;
    let pitch = 0.08;

    const onMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
      if (drag.on && e.pointerId === drag.id) {
        const dx = e.clientX - drag.lastX;
        const dy = e.clientY - drag.lastY;
        drag.lastX = e.clientX;
        drag.lastY = e.clientY;
        drag.vYaw = dx * 0.012;
        drag.yaw += drag.vYaw;
        drag.pitch = Math.max(-0.6, Math.min(0.6, drag.pitch + dy * 0.006));
      }
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button, a")) return;
      drag.on = true;
      drag.id = e.pointerId;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      drag.vYaw = 0;
      root.setPointerCapture(e.pointerId);
      root.classList.add("dragging");
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== drag.id) return;
      drag.on = false;
      root.classList.remove("dragging");
    };
    window.addEventListener("pointermove", onMove);
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);

    const start = performance.now();
    let last = 0;
    let raf = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - last < FRAME_MS) return;
      last = now;
      // web fonts can land late; keep the grid honest
      if (++frames % 30 === 0) measure();

      const { active, hovered, panelOpen } = live.current;
      const elapsed = (now - start) / 1000;
      const t = reduceMotion ? 0 : elapsed;
      const mobile = width < MOBILE_BREAKPOINT;
      const layout = mobile ? "mobile" : "desktop";

      // frame the scene into whatever space the panel leaves free
      const areaX = 0;
      let areaW = width;
      const areaY = HEADER;
      let areaH = height - HEADER - FOOTER;
      if (panelOpen && mobile) {
        areaH = height * 0.38 - HEADER - 8; // sheet covers the bottom 62%
      } else if (panelOpen) {
        areaW = width - Math.min(500, width * 0.44);
      }
      const [x0, x1, y0, y1] =
        panelOpen && mobile ? [-1.4, 1.4, -1.2, 2.35] : BOUNDS[layout];
      const fit = Math.min(
        (areaW * 0.94) / (x1 - x0),
        (areaH * 0.94) / (y1 - y0),
      );
      const targetF = fit * CAM_Z;
      const targetCx = areaX + areaW / 2 - (fit * (x0 + x1)) / 2;
      const targetCy = areaY + areaH / 2 + (fit * (y0 + y1)) / 2;
      const ease = cam.f === 0 ? 1 : 0.12;
      cam.f += (targetF - cam.f) * ease;
      cam.cx += (targetCx - cam.cx) * ease;
      cam.cy += (targetCy - cam.cy) * ease;

      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;

      // let go: coast, then drift back to the nearest full turn
      if (!drag.on) {
        drag.vYaw *= 0.93;
        drag.yaw += drag.vYaw;
        const home = Math.round(drag.yaw / (Math.PI * 2)) * Math.PI * 2;
        drag.yaw += (home - drag.yaw) * 0.025;
        drag.pitch *= 0.95;
      }

      // face the viewer while a channel is tuned so the glass stays legible
      const focused = !!(hovered ?? active);
      const sway = focused ? 0.1 : 1;
      const targetYaw =
        (Math.sin(t * 0.25) * 0.42 + Math.sin(t * 0.11 + 1) * 0.18) * sway +
        pointer.x * (focused ? 0.1 : 0.32) +
        drag.yaw;
      const targetPitch =
        0.1 + Math.sin(t * 0.31) * 0.04 * sway + pointer.y * (focused ? 0.04 : 0.12) + drag.pitch;
      yaw += (targetYaw - yaw) * (drag.on ? 0.5 : 0.08);
      pitch += (targetPitch - pitch) * 0.08;
      const bob = Math.sin(t * 0.9) * 0.06;

      // floating channel options
      const tethers: Tether[] = [];
      const anchors = ANCHORS[layout];
      anchors.forEach(([ax, ay, az], i) => {
        const el = optionRefs.current[i];
        if (!el) return;
        const x = ax + Math.cos(t * 0.5 + i * 2.1) * 0.07 - pointer.x * 0.12;
        const y = ay + Math.sin(t * 0.8 + i * 1.7) * 0.11 - pointer.y * 0.08;
        const z = az + Math.sin(t * 0.4 + i) * 0.15;
        const k = cam.f / (CAM_Z - z);
        const px = cam.cx + x * k;
        const py = cam.cy - y * k;
        const scale = Math.max(0.85, Math.min(1.15, k / (cam.f / CAM_Z)));
        el.style.transform = `translate(${px}px, ${py}px) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
        const hidden = panelOpen && mobile;
        el.style.opacity = hidden ? "0" : "1";
        el.style.pointerEvents = hidden ? "none" : "auto";
        if (!hidden) tethers.push({ from: { x: px, y: py }, side: mobile ? 0 : x < 0 ? -1 : 1 });
      });

      // what the glass shows
      const { tw, th } = AsciiTV.screenSize(cam.f, cw, ch);
      const tuned = channelById(hovered ?? active);
      let screen: string[];
      const sinceTune = (now - tunedAt.current) / 1000;
      if (sinceTune < 0.28 && elapsed > 1.5) {
        const seed = Math.floor(now / 40);
        screen = Array.from({ length: th }, (_, r) =>
          Array.from({ length: tw }, (_, c) => {
            const h = Math.sin((r * 91 + c * 17 + seed) * 12.9898) * 43758.5453;
            return NOISE[Math.floor((h - Math.floor(h)) * NOISE.length)];
          }).join(""),
        );
      } else {
        screen = composeScreen(tw, th, tuned, elapsed);
      }

      const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
      const power = reduceMotion ? 1 : clamp01((elapsed - 0.7) / 0.6);
      const { tone, ink } = tv.render({
        width,
        height,
        cw,
        ch,
        time: t,
        yaw,
        pitch,
        bob,
        f: cam.f,
        cx: cam.cx,
        cy: cam.cy,
        power: power * power * (3 - 2 * power),
        reveal: reduceMotion ? 1 : clamp01(elapsed / 1.1),
        screen,
        tethers,
        parallax: { x: pointer.x, y: pointer.y },
      });
      tonePre.textContent = tone;
      inkPre.textContent = ink;

      if (hudRef.current) {
        const deg = Math.round((((yaw * 180) / Math.PI) % 360 + 360) % 360);
        hudRef.current.textContent = `yaw ${String(deg).padStart(3, "0")}° · pitch ${(pitch * 57.3).toFixed(0).padStart(3, " ")}°`;
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div className="scene" ref={rootRef}>
      <pre className="scene-layer scene-tone" ref={toneRef} aria-hidden="true" />
      <pre className="scene-layer scene-ink" ref={inkRef} aria-hidden="true" />
      <pre className="scene-layer scene-probe" ref={probeRef} aria-hidden="true">
        {Array.from({ length: 10 }, () => "M".repeat(20)).join("\n")}
      </pre>

      <nav className="channels" aria-label="Channels">
        {channels.map((c, i) => (
          <button
            key={c.id}
            ref={(el) => {
              optionRefs.current[i] = el;
            }}
            className={`channel${active === c.id ? " is-active" : ""}`}
            onClick={() => onSelect(c.id)}
            onPointerEnter={() => setHovered(c.id)}
            onPointerLeave={() => setHovered(undefined)}
            onFocus={() => setHovered(c.id)}
            onBlur={() => setHovered(undefined)}
            aria-current={active === c.id ? "page" : undefined}
            aria-label={`${c.label} — ${c.items.length} projects`}
          >
            <span aria-hidden="true">{boxLabel(c.number, c.label)}</span>
          </button>
        ))}
      </nav>

      <span className="hud" ref={hudRef} aria-hidden="true" />
    </div>
  );
}
