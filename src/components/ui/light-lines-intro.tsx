"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./light-lines-intro.module.css";

export default function LightLinesIntro() {
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem("huzaifa-light-lines-seen") === "1";
    } catch {
      // Keep the intro usable when browser storage is disabled.
    }

    if (alreadySeen) {
      setVisible(false);
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const root = rootRef.current;
    if (!canvas || !context || !root) {
      setVisible(false);
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lineColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--intro-line-color")
      .trim() || "#E04E24";
    let frame = 0;
    let animationFrame = 0;
    let dismissTimer = 0;
    let dismissed = false;

    const drawLines = (time: number) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
      }

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.strokeStyle = lineColor;
      context.lineWidth = 1;
      context.shadowColor = lineColor;
      context.shadowBlur = 18;
      const phase = time * 0.00055;
      const center = height * 0.52;
      const amplitude = Math.min(height * 0.27, 190);

      for (let line = 0; line < 32; line += 1) {
        const offset = (line - 15.5) * 7;
        context.globalAlpha = 0.1 + 0.23 * (1 - Math.abs(line - 15.5) / 16);
        context.beginPath();
        for (let x = 0; x <= width + 10; x += 10) {
          const wave = Math.sin(x * (0.004 + (line % 6) * 0.00035) + phase + line * 0.13) * amplitude;
          const detail = Math.sin(x * 0.012 - phase * 0.8 + line * 0.2) * amplitude * 0.12;
          const y = center + offset + wave + detail;
          if (x === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();
      }
      context.globalAlpha = 1;
      frame += 1;
      if (!reducedMotion && frame < 120) animationFrame = window.requestAnimationFrame(drawLines);
    };

    const dismiss = async () => {
      if (dismissed) return;
      dismissed = true;
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(dismissTimer);
      try {
        sessionStorage.setItem("huzaifa-light-lines-seen", "1");
      } catch {
        // The intro still dismisses when storage is disabled.
      }
      if (reducedMotion) {
        setVisible(false);
        return;
      }
      const { animate } = await import("animejs");
      if (!root.isConnected) return;
      animate(root, {
        opacity: [1, 0],
        duration: 620,
        ease: "out(4)",
        onComplete: () => {
          setVisible(false);
        },
      });
    };

    if (reducedMotion) drawLines(0);
    else animationFrame = window.requestAnimationFrame(drawLines);
    dismissTimer = window.setTimeout(() => void dismiss(), reducedMotion ? 650 : 1750);
    const skipButton = root.querySelector("button");
    const skipHandler = () => void dismiss();
    skipButton?.addEventListener("click", skipHandler);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(dismissTimer);
      skipButton?.removeEventListener("click", skipHandler);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.intro} ref={rootRef} role="status" aria-label="Loading Huzaifa Ali's portfolio">
      <canvas className={styles.lines} ref={canvasRef} aria-hidden="true" />
      <div className={styles.introContent}>
        <span className={styles.mark}>H</span>
        <span className={styles.name}>MUHAMMAD HUZAIFA ALI</span>
        <span className={styles.progress}><i /></span>
      </div>
      <button className={styles.skip} type="button">Skip intro</button>
    </div>
  );
}
