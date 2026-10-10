import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AsciiScene from "./scene/AsciiScene";
import { channels, channelById, type Channel } from "./content";
import "./App.css";

const socials = [
  { label: "x", href: "https://x.com/hrlninteractive", name: "X" },
  {
    label: "bsky",
    href: "https://bsky.app/profile/hrln-interactive.com",
    name: "Bluesky",
  },
  {
    label: "in",
    href: "https://linkedin.com/in/harlenpostill",
    name: "LinkedIn",
  },
  { label: "gh", href: "https://github.com/HarlenPostill", name: "GitHub" },
];

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

function Panel({
  channel,
  onClose,
}: {
  channel: Channel;
  onClose: () => void;
}) {
  const info = channelById(channel)!;
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [channel]);

  return (
    <aside className="panel" aria-labelledby="panel-title" key={channel}>
      <div className="panel-bar">
        <span className="panel-path">
          C:\HRLN\{info.label.toUpperCase()}&gt;
        </span>
        <button className="panel-close" onClick={onClose} aria-label="Close">
          [esc]
        </button>
      </div>

      <div className="panel-tabs" role="tablist">
        {channels.map((c) => (
          <Link
            key={c.id}
            to={`/${c.id}`}
            role="tab"
            aria-selected={c.id === channel}
            className={`panel-tab${c.id === channel ? " is-active" : ""}`}
          >
            {c.number} {c.label}
          </Link>
        ))}
      </div>

      <header className="panel-head">
        <h2 id="panel-title" ref={headingRef} tabIndex={-1}>
          {info.label}
        </h2>
        <p>{info.blurb}</p>
      </header>

      <ol className="entries">
        {info.items.map((item, i) => (
          <li key={item.title} style={{ animationDelay: `${120 + i * 70}ms` }}>
            <a
              className="entry"
              href={item.url}
              target="_blank"
              rel="noreferrer"
            >
              <span className="entry-index">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="entry-body">
                <span className="entry-top">
                  <span className="entry-title">{item.title}</span>
                  {item.date && <span className="entry-date">{item.date}</span>}
                </span>
                <span className="entry-role">{item.role}</span>
                <span className="entry-desc">{item.description}</span>
                <span className="entry-link">→ {hostOf(item.url)}</span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const active = channelById(pathname.replace(/\//g, ""))?.id;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") navigate("/");
      const n = Number(e.key);
      if (n >= 1 && n <= channels.length) navigate(`/${channels[n - 1].id}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  useEffect(() => {
    const info = channelById(active);
    document.title = info
      ? `${info.label} — Harlen Postill`
      : "Harlen Postill | Software Engineer & UI/UX Designer";
  }, [active]);

  return (
    <div className={`app${active ? " has-panel" : ""}`}>
      <AsciiScene
        active={active}
        panelOpen={!!active}
        onSelect={(c) => navigate(c === active ? "/" : `/${c}`)}
      />

      <header className="masthead">
        <Link to="/" className="masthead-name">
          <h1>Harlen Postill</h1>
        </Link>
        <p className="masthead-role">software engineer &amp; ui/ux designer</p>
      </header>

      <nav className="socials" aria-label="Elsewhere">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            aria-label={s.name}
          >
            [{s.label}]
          </a>
        ))}
        <Link to="/recipes" aria-label="Recipes">
          [recipes]
        </Link>
      </nav>

      <footer className="footnote">
        <span>HRLN INTERACTIVE ©{new Date().getFullYear()}</span>
        <span className="footnote-hint">drag to turn · press 1–4 to tune</span>
      </footer>

      {active && <Panel channel={active} onClose={() => navigate("/")} />}
    </div>
  );
}

export default App;
