import { channels, type ChannelInfo } from "../content";

/** Compose the text shown on the CRT glass as TH rows of TW chars. */
export function composeScreen(
  tw: number,
  th: number,
  tuned: ChannelInfo | undefined,
  time: number,
): string[] {
  const pad = tw >= 24 ? 2 : 1;
  const inner = Math.max(1, tw - pad * 2);
  const cursor = Math.floor(time * 2) % 2 ? "_" : " ";
  const lines: string[] = [];

  const spread = (left: string, right: string) => {
    const gap = inner - left.length - right.length;
    return gap >= 1 ? left + " ".repeat(gap) + right : left;
  };
  const rule = "-".repeat(inner);

  if (!tuned) {
    const clock = new Date().toTimeString().slice(0, 5);
    lines.push(spread("HRLN-TV", clock));
    lines.push(rule);
    if (inner >= 20) {
      lines.push("HARLEN POSTILL");
      lines.push(inner >= 30 ? "software engineer & ui/ux" : "software engineer");
      lines.push("");
    }
    lines.push(`> tune a channel${cursor}`);
    for (const c of channels) {
      lines.push(spread(` ${c.number} ${c.label.toUpperCase()}`, `${c.items.length}`));
    }
  } else {
    lines.push(spread(`CH ${tuned.number}`, tuned.label.toUpperCase()));
    lines.push(rule);
    lines.push(`> ls ./${tuned.id}`);
    for (const item of tuned.items) {
      lines.push(` ${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}/`);
    }
    lines.push("");
    lines.push(`${tuned.items.length} entries${cursor}`);
  }

  const top = th > lines.length + 2 ? 1 : 0;
  const out: string[] = [];
  for (let r = 0; r < th; r++) {
    const text = (lines[r - top] ?? "").slice(0, inner);
    out.push((" ".repeat(pad) + text).padEnd(tw, " ").slice(0, tw));
  }
  return out;
}
