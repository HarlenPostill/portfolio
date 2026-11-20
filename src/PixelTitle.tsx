import { useEffect, useRef } from "react";

const TEXT = "Harlen";
const FONT_SIZE = 28;
const FONT = `600 ${FONT_SIZE}px "Funnel Display", sans-serif`;
const CELL = 2; // CSS px per pixel block
const PAD = 2;
const COL_STEP = 11; // ms of delay per column: the wave travels left → right
const ROW_STEP = 4; // tiny top → bottom lag so each column ripples
const LIFT = 3; // px each pixel rises as the wave passes
const FLIP_MS = 520;
const INTRO_DELAY = 120;

type Cell = { x: number; y: number; delay: number };
type Mode = "intro" | "flip";

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export default function PixelTitle() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ flip: () => void } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let cells: Cell[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let waveMs = 0;
    let raf = 0;
    let animating = false;
    let cancelled = false;
    // The real, crisp title rendered once at device resolution. Every frame
    // (resting or animating) is drawn from slices of this same bitmap, so the
    // pixels line up 1:1 with the text before and after the wave.
    const source = document.createElement("canvas");
    const sctx = source.getContext("2d", { willReadFrequently: true })!;
    let textX = 0;
    let baseline = 0;

    const color = () => getComputedStyle(canvas).color;

    const rasterise = () => {
      sctx.setTransform(1, 0, 0, 1, 0, 0);
      sctx.clearRect(0, 0, source.width, source.height);
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sctx.font = FONT;
      sctx.fillStyle = color();
      sctx.fillText(TEXT, textX, baseline);
    };

    const setup = () => {
      ctx.font = FONT;
      const m = ctx.measureText(TEXT);
      width =
        Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight) + PAD * 2;
      height =
        Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) +
        PAD * 2 +
        LIFT;
      width += (CELL - (width % CELL)) % CELL;
      height += (CELL - (height % CELL)) % CELL;
      baseline = PAD + LIFT + m.actualBoundingBoxAscent;
      textX = PAD + m.actualBoundingBoxLeft;

      dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
      canvas.width = source.width = width * dpr;
      canvas.height = source.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = false;

      rasterise();
      const data = sctx.getImageData(0, 0, source.width, source.height).data;
      const tile = CELL * dpr;

      cells = [];
      for (let cy = 0; cy < source.height; cy += tile) {
        for (let cx = 0; cx < source.width; cx += tile) {
          let any = false;
          for (let y = cy; y < cy + tile && !any; y++)
            for (let x = cx; x < cx + tile; x++)
              if (data[(y * source.width + x) * 4 + 3]) {
                any = true;
                break;
              }
          if (any) {
            const col = cx / tile;
            const row = cy / tile;
            cells.push({
              x: cx,
              y: cy,
              delay: col * COL_STEP + row * ROW_STEP,
            });
          }
        }
      }
      waveMs = Math.max(...cells.map((c) => c.delay)) + FLIP_MS;
    };

    const drawText = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(source, 0, 0);
    };

    const drawFrame = (mode: Mode, t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const tile = CELL * dpr;
      for (const c of cells) {
        const p = Math.min(1, Math.max(0, (t - c.delay) / FLIP_MS));
        if (mode === "intro" && p === 0) continue;
        if (p === 0 || p === 1) {
          // At rest: copy the tile exactly as the text renders it.
          ctx.globalAlpha = 1;
          ctx.drawImage(source, c.x, c.y, tile, tile, c.x, c.y, tile, tile);
          continue;
        }
        const e = easeInOut(p);
        let alpha = 1;
        let angle: number;
        if (mode === "intro") {
          angle = (1 - e) * Math.PI; // spins in from its back face
          alpha = Math.min(1, p * 2);
        } else {
          angle = e * Math.PI * 2; // one full spin around the Y axis
        }
        const cos = Math.cos(angle);
        const sx = Math.abs(cos);
        if (sx < 0.02) continue;
        if (cos < 0) alpha *= 0.45; // back face is dimmer
        const lift = Math.sin(p * Math.PI) * LIFT * dpr; // stand up as the wave passes
        const w = tile * sx;
        ctx.globalAlpha = alpha;
        ctx.drawImage(
          source,
          c.x,
          c.y,
          tile,
          tile,
          c.x + (tile - w) / 2,
          c.y - lift,
          w,
          tile,
        );
      }
      ctx.globalAlpha = 1;
    };

    const run = (mode: Mode, startDelay = 0) => {
      if (reduceMotion || animating) return;
      animating = true;
      const start = performance.now() + startDelay;
      const tick = (now: number) => {
        const t = now - start;
        if (t >= waveMs) {
          animating = false;
          drawText();
          return;
        }
        drawFrame(mode, Math.max(0, t));
        raf = requestAnimationFrame(tick);
      };
      if (mode === "intro") drawFrame("intro", 0);
      raf = requestAnimationFrame(tick);
    };

    api.current = { flip: () => run("flip") };

    const redrawIfIdle = () => {
      if (!width) return;
      rasterise(); // pick up the new theme colour
      if (!animating) drawText();
    };
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    darkQuery.addEventListener("change", redrawIfIdle);
    const themeObserver = new MutationObserver(redrawIfIdle);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    document.fonts.load(FONT).then(() => {
      if (cancelled) return;
      setup();
      if (reduceMotion) drawText();
      else run("intro", INTRO_DELAY);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      darkQuery.removeEventListener("change", redrawIfIdle);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <h1
      className="pixel-title"
      aria-label={TEXT}
      onMouseEnter={() => api.current?.flip()}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
    </h1>
  );
}
