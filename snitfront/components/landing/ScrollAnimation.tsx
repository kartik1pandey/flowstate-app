'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TextOverlay {
  /** 0‑1 – scroll progress at which the text starts to appear */
  startAt: number;
  /** 0‑1 – scroll progress at which the text is fully visible  */
  peakAt: number;
  /** 0‑1 – scroll progress at which the text fades out          */
  endAt: number;
  /** Main heading text */
  heading: string;
  /** Smaller sub‑text below the heading */
  subtext?: string;
  /** Optional position override */
  position?: 'center' | 'bottom-center' | 'top-center';
}

export interface ScrollAnimationProps {
  /** Total number of frames in the sequence */
  frameCount: number;
  /** Path prefix, e.g. "/frames/ezgif-frame-" */
  framePath: string;
  /** File extension including dot, e.g. ".jpg" */
  frameExtension?: string;
  /**
   * How many digits each frame number is zero‑padded to.
   * E.g. 3 → "001", "002" …
   */
  framePadding?: number;
  /** Starting frame number (default 1) */
  frameStart?: number;
  /** Height multiplier for scroll distance – more = slower scrub */
  scrollHeightMultiplier?: number;
  /** Overlay text blocks that appear / disappear during scroll */
  textOverlays?: TextOverlay[];
  /** Optional className for the outer wrapper */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ScrollAnimation({
  frameCount,
  framePath,
  frameExtension = '.jpg',
  framePadding = 3,
  frameStart = 1,
  scrollHeightMultiplier = 5,
  textOverlays = [],
  className = '',
}: ScrollAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  /* ---- helpers ---- */

  const padNumber = useCallback(
    (n: number) => String(n).padStart(framePadding, '0'),
    [framePadding],
  );

  const getFrameSrc = useCallback(
    (index: number) => `${framePath}${padNumber(index + frameStart)}${frameExtension}`,
    [framePath, frameExtension, framePadding, frameStart, padNumber],
  );

  /* ---- draw a frame to canvas ---- */

  const renderFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const img = imagesRef.current[frameIndex];
      if (!canvas || !ctx || !img) return;

      /* Cover the canvas like background‑size: cover */
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.naturalWidth / img.naturalHeight;

      let sx = 0,
        sy = 0,
        sw = img.naturalWidth,
        sh = img.naturalHeight;

      if (imgRatio > canvasRatio) {
        sw = img.naturalHeight * canvasRatio;
        sx = (img.naturalWidth - sw) / 2;
      } else {
        sh = img.naturalWidth / canvasRatio;
        sy = (img.naturalHeight - sh) / 2;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    },
    [],
  );

  /* ---- resize canvas to viewport ---- */

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    renderFrame(currentFrameRef.current);
  }, [renderFrame]);

  /* ---- preload images in batches ---- */

  useEffect(() => {
    let cancelled = false;
    const images: HTMLImageElement[] = new Array(frameCount);

    const loadImage = (index: number): Promise<void> =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (cancelled) return;
          images[index] = img;
          resolve();
        };
        img.onerror = () => resolve(); // skip broken frames
        img.src = getFrameSrc(index);
      });

    const BATCH_SIZE = 20;

    const loadAll = async () => {
      for (let batch = 0; batch < frameCount; batch += BATCH_SIZE) {
        if (cancelled) return;
        const batchEnd = Math.min(batch + BATCH_SIZE, frameCount);
        const promises: Promise<void>[] = [];
        for (let i = batch; i < batchEnd; i++) {
          promises.push(loadImage(i));
        }
        await Promise.all(promises);
        if (!cancelled) {
          setLoadingProgress(Math.round((batchEnd / frameCount) * 100));
        }
      }
      if (!cancelled) {
        imagesRef.current = images;
        setIsLoaded(true);
      }
    };

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [frameCount, getFrameSrc]);

  /* ---- GSAP ScrollTrigger ---- */

  useEffect(() => {
    if (!isLoaded) return;

    // Initial paint
    resizeCanvas();
    renderFrame(0);

    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      pin: canvasRef.current?.parentElement ?? undefined,
      scrub: 0.15,
      onUpdate: (self) => {
        const progress = self.progress; // 0‑1
        const frameIndex = Math.min(
          frameCount - 1,
          Math.floor(progress * frameCount),
        );
        if (frameIndex !== currentFrameRef.current) {
          currentFrameRef.current = frameIndex;
          requestAnimationFrame(() => renderFrame(frameIndex));
        }
        setScrollProgress(progress);
      },
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      trigger.kill();
    };
  }, [isLoaded, frameCount, renderFrame, resizeCanvas]);

  /* ---- compute overlay opacity for a given text block ---- */

  const getOverlayOpacity = (overlay: TextOverlay): number => {
    const { startAt, peakAt, endAt } = overlay;
    if (scrollProgress <= startAt || scrollProgress >= endAt) return 0;
    if (scrollProgress <= peakAt)
      return (scrollProgress - startAt) / (peakAt - startAt);
    return 1 - (scrollProgress - peakAt) / (endAt - peakAt);
  };

  const getOverlayY = (overlay: TextOverlay): number => {
    const opacity = getOverlayOpacity(overlay);
    // slight parallax: translate from 30px → 0 as it fades in, 0 → -30px as it fades out
    if (scrollProgress <= overlay.peakAt) return 30 * (1 - opacity);
    return -30 * (1 - opacity);
  };

  const positionClasses: Record<string, string> = {
    center: 'items-center justify-center',
    'bottom-center': 'items-end justify-center pb-24',
    'top-center': 'items-start justify-center pt-24',
  };

  /* ---- render ---- */

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ height: `${scrollHeightMultiplier * 100}vh` }}
    >
      {/* Sticky viewport ---------------------------------------------------- */}
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        {/* Loading screen */}
        {!isLoaded && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900">
            <div className="relative w-64 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 tracking-widest uppercase">
              Loading experience… {loadingProgress}%
            </p>
          </div>
        )}

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Dark vignette overlay for text legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

        {/* Text overlays ---------------------------------------------------- */}
        {textOverlays.map((overlay, i) => {
          const opacity = getOverlayOpacity(overlay);
          const y = getOverlayY(overlay);
          const pos = overlay.position ?? 'center';
          if (opacity <= 0) return null;
          return (
            <div
              key={i}
              className={`absolute inset-0 flex flex-col ${positionClasses[pos]} text-center px-6 pointer-events-none`}
              style={{
                opacity,
                transform: `translateY(${y}px)`,
                transition: 'transform 0.1s linear',
              }}
            >
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)] leading-tight max-w-4xl">
                {overlay.heading}
              </h2>
              {overlay.subtext && (
                <p className="mt-4 text-lg sm:text-xl md:text-2xl text-gray-200 drop-shadow-lg max-w-2xl">
                  {overlay.subtext}
                </p>
              )}
            </div>
          );
        })}

        {/* Scroll progress indicator */}
        {isLoaded && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
            <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/40" />
            <span className="text-[10px] text-white/40 uppercase tracking-[0.2em]">
              Scroll
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
