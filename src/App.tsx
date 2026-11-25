import { useEffect, useState, useSyncExternalStore } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  channels,
  channelById,
  socials,
  SPONSOR_EMAIL,
  TAGLINE,
  type Channel,
} from "./content";
import PixelTitle from "./PixelTitle";
import ShaderBackground from "./ShaderBackground";
import DevStrengthPanel from "./DevStrengthPanel";
import "./App.css";

const icons: Record<string, React.ReactNode> = {
  X: (
    <path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.2 21H2.1l7.3-8.3L1.8 3h6.4l4.4 5.9L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" />
  ),
  Bluesky: (
    <path d="M5.9 3.8C8.4 5.7 11 9.4 12 11.4c1-2 3.6-5.7 6.1-7.6 1.8-1.3 4.7-2.4 4.7.9 0 .7-.4 5.5-.6 6.3-.8 2.8-3.6 3.5-6.1 3.1 4.4.7 5.5 3.2 3.1 5.7-4.6 4.7-6.6-1.2-7.1-2.7l-.1-.4-.1.4c-.5 1.5-2.5 7.4-7.1 2.7-2.4-2.5-1.3-5 3.1-5.7-2.5.4-5.3-.3-6.1-3.1C1.6 10.2 1.2 5.4 1.2 4.7c0-3.3 2.9-2.2 4.7-.9Z" />
  ),
  LinkedIn: (
    <path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6h.1c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2ZM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2ZM7.1 20.5H3.5V9h3.6v11.5Z" />
  ),
  GitHub: (
    <path d="M12 1.5a10.5 10.5 0 0 0-3.3 20.5c.5.1.7-.2.7-.5v-1.8c-2.9.6-3.5-1.4-3.5-1.4-.5-1.2-1.2-1.5-1.2-1.5-1-.7 0-.6 0-.6 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.5 1.1 3.1.9.1-.7.4-1.1.7-1.4-2.3-.3-4.8-1.2-4.8-5.2 0-1.1.4-2.1 1.1-2.8-.1-.3-.5-1.3.1-2.8 0 0 .9-.3 2.9 1.1a10 10 0 0 1 5.2 0c2-1.4 2.9-1.1 2.9-1.1.6 1.5.2 2.5.1 2.8.7.8 1.1 1.7 1.1 2.8 0 4-2.5 4.9-4.8 5.2.4.3.7 1 .7 1.9v2.9c0 .3.2.6.7.5A10.5 10.5 0 0 0 12 1.5Z" />
  ),
  YouTube: (
    <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2C.5 9.1.5 12 .5 12s0 2.9.5 4.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-4.8.5-4.8s0-2.9-.5-4.8ZM9.7 15.5v-7l6 3.5-6 3.5Z" />
  ),
};

type Theme = "light" | "dark";

// Null while prerendering at build time, where there is no window.
const darkQuery =
  typeof window === "undefined"
    ? null
    : window.matchMedia("(prefers-color-scheme: dark)");

// False in the prerendered HTML and during hydration, true afterwards.
const noop = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

const readStored = (): Theme | null => {
  try {
    const v = localStorage.getItem("theme");
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
};

function ThemeToggle() {
  const [stored, setStored] = useState<Theme | null>(readStored);
  const [system, setSystem] = useState<Theme>(
    darkQuery?.matches ? "dark" : "light",
  );
  const theme = stored ?? system;

  useEffect(() => {
    const onChange = (e: MediaQueryListEvent) =>
      setSystem(e.matches ? "dark" : "light");
    darkQuery?.addEventListener("change", onChange);
    return () => darkQuery?.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (stored) document.documentElement.dataset.theme = stored;
    else delete document.documentElement.dataset.theme;
  }, [stored]);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    // Picking the system theme again goes back to following the system.
    const value = next === system ? null : next;
    try {
      if (value) localStorage.setItem("theme", value);
      else localStorage.removeItem("theme");
    } catch {
      /* storage unavailable */
    }
    setStored(value);
  };

  // The prerendered HTML can't know the visitor's theme, so the label waits
  // for hydration and the icon is picked by CSS (see .theme-icon in App.css).
  const hydrated = useHydrated();
  const label =
    hydrated && theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      <svg className="theme-icon theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true">
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </g>
      </svg>
      <svg className="theme-icon theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5a8.5 8.5 0 1 0 10.6 10.6Z"
          />
      </svg>
    </button>
  );
}

type Section = Channel | "sponsors";

// The build year in the prerendered HTML, then the visitor's clock once
// hydrated, in case the site was built in an earlier year.
function Year() {
  const year = useSyncExternalStore(
    noop,
    () => new Date().getFullYear(),
    () => __BUILD_YEAR__,
  );
  return <>{year}</>;
}

function App() {
  const { pathname } = useLocation();
  const slug = pathname.replace(/\//g, "");
  const initial: Section | undefined =
    slug === "sponsors" ? "sponsors" : channelById(slug)?.id;
  const [open, setOpen] = useState<Section | null>(initial ?? null);
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SPONSOR_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  useEffect(() => {
    document.title = "Harlen Postill — Software Engineer & Designer";
  }, []);

  const toggle = (id: Section) => setOpen((prev) => (prev === id ? null : id));

  return (
    <div className="page">
      <ShaderBackground />
      {import.meta.env.DEV && <DevStrengthPanel />}
      <header
        className="top reveal"
        style={{ "--delay": "0ms" } as React.CSSProperties}
      >
        <div className="intro">
          <Link to="/" className="name">
            <PixelTitle />
          </Link>
          <p className="tagline">
            {TAGLINE}
          </p>
        </div>
        <ThemeToggle />
      </header>

      <main className="directory">
        {channels.map((c, i) => {
          const isOpen = open === c.id;
          return (
            <section
              key={c.id}
              className={`group reveal${isOpen ? " is-open" : ""}`}
              style={{ "--delay": `${180 + i * 70}ms` } as React.CSSProperties}
            >
              <h2>
                <button
                  className="group-head"
                  aria-expanded={isOpen}
                  aria-controls={`group-${c.id}`}
                  onClick={() => toggle(c.id)}
                >
                  <span className="group-label">{c.label}</span>
                  <span className="group-meta">
                    <span className="group-count">{c.items.length}</span>
                    <span className="group-icon" aria-hidden="true" />
                  </span>
                </button>
              </h2>
              <div id={`group-${c.id}`} className="group-body" inert={!isOpen}>
                <ul className="items">
                  {c.items.map((item) => (
                    <li key={item.title}>
                      <a
                        className="item"
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="item-row">
                          <span className="item-title">{item.title}</span>
                          <span className="item-role">{item.role}</span>
                        </span>
                        <span className="item-desc">{item.description}</span>
                        {item.date && (
                          <span className="item-date">{item.date}</span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}
        <section
          className={`group reveal${open === "sponsors" ? " is-open" : ""}`}
          style={
            {
              "--delay": `${180 + channels.length * 70}ms`,
            } as React.CSSProperties
          }
        >
          <h2>
            <button
              className="group-head"
              aria-expanded={open === "sponsors"}
              aria-controls="group-sponsors"
              onClick={() => toggle("sponsors")}
            >
              <span className="group-label">Sponsors</span>
              <span className="group-meta">
                <span className="group-icon" aria-hidden="true" />
              </span>
            </button>
          </h2>
          <div
            id="group-sponsors"
            className="group-body"
            inert={open !== "sponsors"}
          >
            <div className="items">
              <div className="contact">
                <p className="item-desc">
                  For brand partnerships, sponsorships and collaborations, get
                  in touch.
                </p>
                <div className="contact-row">
                  <a className="contact-email" href={`mailto:${SPONSOR_EMAIL}`}>
                    <span className="item-title">{SPONSOR_EMAIL}</span>
                  </a>
                  <button className="contact-copy" onClick={copyEmail}>
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer
        className="foot reveal"
        style={
          {
            "--delay": `${180 + (channels.length + 1) * 70 + 60}ms`,
          } as React.CSSProperties
        }
      >
        <span>
          © <Year /> HRLN Interactive
        </span>
        <nav className="socials" aria-label="Social links">
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={s.name}
              title={s.name}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {icons[s.name]}
              </svg>
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
}

export default App;
