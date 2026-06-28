"use client";

import { useEffect, useRef, useState } from "react";

const notes = [
  {
    number: "01",
    title: "Fast",
    body: "Static export, quick deploys, and simple edits.",
  },
  {
    number: "02",
    title: "Calm",
    body: "Neutral spacing and restrained color keep the page light.",
  },
  {
    number: "03",
    title: "Open",
    body: "Replace this section with any content you want later.",
  },
];

const importPublicModule = (filename) => {
  const url = new URL(filename, document.baseURI);
  url.searchParams.set("v", "portrait-mobile-v2");
  return new Function("url", "return import(url)")(url.href);
};

const publicAssetUrl = (filename) => new URL(filename, document.baseURI).href;

const mobileSceneQuery =
  "(max-width: 760px), (pointer: coarse) and (orientation: portrait)";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileHero, setIsMobileHero] = useState(false);
  const [sceneDataFile, setSceneDataFile] = useState(null);
  const canvasRef = useRef(null);
  const pageRef = useRef(null);
  const runtimeRef = useRef(null);
  const heroPointerRef = useRef(null);
  const suppressNextClickRef = useRef(false);

  const handleHeroPointerDown = (event) => {
    heroPointerRef.current = {
      x: event.clientX,
      y: event.clientY,
      moved: false,
    };
  };

  const handleHeroPointerMove = (event) => {
    const pointer = heroPointerRef.current;
    if (!pointer) return;

    const distance = Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y);
    pointer.moved = pointer.moved || distance > 12;
  };

  const handleHeroPointerUp = () => {
    suppressNextClickRef.current = heroPointerRef.current?.moved ?? false;
    heroPointerRef.current = null;
  };

  const handleHeroClick = () => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }

    setIsOpen(true);
  };

  const handleHeroKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  useEffect(() => {
    const media = window.matchMedia(mobileSceneQuery);
    const updateSceneDataFile = () => {
      setIsMobileHero(media.matches);
      setSceneDataFile(
        media.matches ? "hana-scene-data-mobile.mjs" : "hana-scene-data.mjs",
      );
    };

    updateSceneDataFile();
    media.addEventListener("change", updateSceneDataFile);

    return () => {
      media.removeEventListener("change", updateSceneDataFile);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("page-open", isOpen);

    if (isOpen) {
      window.setTimeout(() => {
        pageRef.current?.focus({ preventScroll: true });
      }, 240);
    }

    return () => {
      document.body.classList.remove("page-open");
    };
  }, [isOpen]);

  useEffect(() => {
    if (!sceneDataFile) {
      runtimeRef.current?.dispose();
      runtimeRef.current = null;
      return undefined;
    }

    let isDisposed = false;

    const loadScene = async () => {
      runtimeRef.current?.dispose();
      runtimeRef.current = null;

      const [{ HanaRuntime }, { default: sceneData }] = await Promise.all([
        importPublicModule("hana-runtime.mjs"),
        importPublicModule(sceneDataFile),
      ]);

      if (isDisposed || !canvasRef.current) return;

      const runtime = new HanaRuntime(canvasRef.current, {
        loading: "eager",
        wasmURL: publicAssetUrl("hana.wasm"),
      });

      runtimeRef.current = runtime;
      await runtime.start(sceneData);

      if (isDisposed) {
        runtime.dispose();
      }
    };

    loadScene().catch((error) => {
      console.error("Failed to load Hana scene", error);
    });

    return () => {
      isDisposed = true;
      runtimeRef.current?.dispose();
      runtimeRef.current = null;
    };
  }, [sceneDataFile]);

  return (
    <>
      <section
        className={`spline-splash${isOpen ? " is-hidden" : ""}`}
        aria-label="Interactive hero"
      >
        <canvas
          ref={canvasRef}
          className="spline-canvas"
          aria-label={
            isMobileHero
              ? "Interactive mobile Spline hero"
              : "Interactive Spline hero"
          }
          tabIndex={0}
          onPointerDown={handleHeroPointerDown}
          onPointerMove={handleHeroPointerMove}
          onPointerUp={handleHeroPointerUp}
          onPointerCancel={() => {
            heroPointerRef.current = null;
            suppressNextClickRef.current = true;
          }}
          onClick={handleHeroClick}
          onKeyDown={handleHeroKeyDown}
        />
      </section>

      <main
        ref={pageRef}
        className={`simple-page${isOpen ? " is-visible" : ""}`}
        id="page"
        aria-hidden={isOpen ? undefined : "true"}
        tabIndex={-1}
      >
        <header className="page-header">
          <a className="brand" href="#page">
            Simple
          </a>
          <nav aria-label="Primary navigation">
            <a href="#about">About</a>
            <a href="#notes">Notes</a>
            <a href="#contact">Contact</a>
          </nav>
        </header>

        <section className="intro" id="about">
          <p className="eyebrow">Minimal Page</p>
          <h1>A quiet page after the hero.</h1>
          <p>
            Clean layout, simple typography, and enough room for the Spline entry
            to remain the main event.
          </p>
        </section>

        <section className="notes" id="notes" aria-label="Notes">
          {notes.map((note) => (
            <div key={note.number}>
              <span>{note.number}</span>
              <h2>{note.title}</h2>
              <p>{note.body}</p>
            </div>
          ))}
        </section>

        <section className="contact" id="contact">
          <p>Ready for whatever comes next.</p>
          <a href="mailto:hello@example.com">hello@example.com</a>
        </section>
      </main>
    </>
  );
}
