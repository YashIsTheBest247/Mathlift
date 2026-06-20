import { useEffect, useRef, useState } from "react";
import Form from "./components/Form.jsx";
import Results from "./components/Results.jsx";
import VideoIntro from "./components/VideoIntro.jsx";
import WakeLoader from "./components/WakeLoader.jsx";
import HeroEquations from "./components/HeroEquations.jsx";
import FeatureShowcase from "./components/FeatureShowcase.jsx";
import Typewriter from "./components/Typewriter.jsx";
import { processPdf } from "./api.js";

const HERO_WORDS = ["scales", "renders", "publishes", "transforms", "ships", "automates"];

const reduceMotion =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function App() {
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [dark, setDark] = useState(false);
  const [videoDone, setVideoDone] = useState(reduceMotion);
  const [backendReady, setBackendReady] = useState(false);
  const toolRef = useRef(null);
  const resultRef = useRef(null);
  const footerRef = useRef(null);

  const ready = videoDone && backendReady;

  useEffect(() => {
    document.body.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  useEffect(() => {
    let active = true;
    let timer;
    async function ping() {
      try {
        const controller = new AbortController();
        const abort = window.setTimeout(() => controller.abort(), 4000);
        const response = await fetch("/api/health", { signal: controller.signal });
        window.clearTimeout(abort);
        if (response.ok) {
          if (active) {
            setBackendReady(true);
          }
          return;
        }
      } catch (caught) {
        void caught;
      }
      if (active) {
        timer = window.setTimeout(ping, 1500);
      }
    }
    ping();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  function scrollToTool() {
    toolRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToFooter() {
    footerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToFeatures() {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const links = [
    { label: "Extract", action: scrollToTool },
    { label: "Features", action: scrollToFeatures },
    { label: "About", action: scrollToFooter },
  ];

  async function handleSubmit(payload) {
    setBusy(true);
    setError("");
    setData(null);
    try {
      const result = await processPdf(payload);
      setData(result);
      requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    } catch (caught) {
      setError(caught.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={ready ? "page is-ready" : "page"}>
      {!videoDone ? <VideoIntro onComplete={() => setVideoDone(true)} /> : null}
      {videoDone && !backendReady ? <WakeLoader /> : null}

      <header className="nav-wrap">
        <nav className="pill">
          <button className="pill-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            mathlift<sup>®</sup>
          </button>
          <div className="pill-links">
            {links.map((link) => (
              <button key={link.label} className="pill-link" onClick={link.action}>
                {link.label}
              </button>
            ))}
          </div>
          <div className="pill-actions">
            <button className="pill-ghost" onClick={() => setDark((value) => !value)} aria-label="Toggle theme">
              {dark ? "☼" : "☾"}
            </button>
            <button className="pill-cta" onClick={scrollToTool}>
              Run 
            </button>
          </div>
        </nav>
      </header>

      <section className="hero">
        <HeroEquations />
        <div className="hero-grid">
          <aside className="promo">
            <div className="promo-top">
              <span className="promo-mark">mathlift<sup>®</sup></span>
              <p className="promo-copy">
                We turn dense mathematics PDFs into clean question images and
                structured LaTeX.
              </p>
              <p className="promo-strong">
                From paper to renderable questions in seconds.
              </p>
            </div>
          </aside>

          <div className="hero-mid">
            <span className="hero-mid-tag">how it works</span>
            <ol className="hero-steps">
              <li className="hero-step">
                <span className="hero-step-num">01</span>
                <span className="hero-step-text">upload a maths pdf</span>
              </li>
              <li className="hero-step">
                <span className="hero-step-num">02</span>
                <span className="hero-step-text">ai detects each question</span>
              </li>
              <li className="hero-step">
                <span className="hero-step-num">03</span>
                <span className="hero-step-text">get images or latex</span>
              </li>
            </ol>
          </div>

          <div className="hero-head">
            <h1 className="hero-title">
              extract<br />
              maths<br />
              that<br />
              <Typewriter words={HERO_WORDS} />
            </h1>
            <button className="hero-pitch" onClick={scrollToTool}>
              <span className="hero-pitch-circle">→</span>
              <span>Start extracting</span>
            </button>
          </div>
        </div>

        <div className="ghost">math</div>
      </section>

      <section className="tool" ref={toolRef}>
        <div className="tool-head">
          <span className="section-tag">02 — Pipeline</span>
          <h2 className="tool-title">Built to extract.</h2>
        </div>

        <div className="tool-grid">
          <Form onSubmit={handleSubmit} busy={busy} />
          <div className="result-wrap" ref={resultRef}>
            {error ? <div className="banner-error">{error}</div> : null}
            <Results data={data} busy={busy} />
          </div>
        </div>
      </section>

      <FeatureShowcase />

      <footer className="footer" ref={footerRef}>
        <span className="section-tag tag-invert">04 — Studio</span>
        <h2 className="footer-title">
          Ready to<br />extract?
        </h2>
        <div className="footer-grid">
          <div className="footer-block">
            <span className="footer-label">Image mode</span>
            <p>Detects each question and crops it as a clean standalone image.</p>
          </div>
          <div className="footer-block">
            <span className="footer-label">Text mode</span>
            <p>Transcribes questions to LaTeX, rendered live with KaTeX.</p>
          </div>
          <div className="footer-block">
            <span className="footer-label">Figures</span>
            <p>Diagrams and graphs are extracted alongside the question text.</p>
          </div>
        </div>
        <div className="footer-bar">
          <div className="footer-bar-left">
            <span className="footer-brand">mathlift<sup>®</sup></span>
            <span className="footer-meta">© 2026 · All Rights Reserved.</span>
          </div>
          <div className="footer-connect">
            <span className="footer-label">Connect with Developer</span>
            <div className="footer-connect-links">
              <a className="footer-link" href="https://yash-munshi.vercel.app/" target="_blank" rel="noreferrer">
                <svg className="footer-ic" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
                </svg>
                Portfolio
              </a>
              <a className="footer-link" href="https://github.com/YashIsTheBest247" target="_blank" rel="noreferrer">
                <svg className="footer-ic" viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                GitHub
              </a>
              <a className="footer-link" href="https://www.linkedin.com/in/yash-munshi-a0408b337/" target="_blank" rel="noreferrer">
                <svg className="footer-ic" viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
        </div>
        <div className="ghost ghost-dark">mathlift</div>
      </footer>
    </div>
  );
}
