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
      const hideFrame = window.requestAnimationFrame(() => setVisible(false));
      return () => window.cancelAnimationFrame(hideFrame);
    }

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const root = rootRef.current;
    if (!canvas || !context || !root) {
      const hideFrame = window.requestAnimationFrame(() => setVisible(false));
      return () => window.cancelAnimationFrame(hideFrame);
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lineColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--intro-line-color")
      .trim() || "#E04E24";
    let frame = 0;
    let animationFrame = 0;
    let dismissTimer = 0;
    let dismissed = false;
    let width = 0;
    let height = 0;
    let ratio = 1;

    const resizeCanvas = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const drawLines = (time: number) => {
      context.clearRect(0, 0, width, height);
      context.strokeStyle = lineColor;
      context.lineWidth = 1;
      context.shadowColor = lineColor;
      context.shadowBlur = 12;
      const phase = time * 0.00055;
      const center = height * 0.52;
      const amplitude = Math.min(height * 0.27, 190);
      const lineCount = 24;
      const middleLine = (lineCount - 1) / 2;

      for (let line = 0; line < lineCount; line += 1) {
        const offset = (line - middleLine) * 8.5;
        context.globalAlpha =
          0.1 + 0.23 * (1 - Math.abs(line - middleLine) / (lineCount / 2));
        context.beginPath();
        for (let x = 0; x <= width + 14; x += 14) {
          const wave =
            Math.sin(
              x * (0.004 + (line % 6) * 0.00035) +
                phase +
                line * 0.13,
            ) * amplitude;
          const detail =
            Math.sin(x * 0.012 - phase * 0.8 + line * 0.2) *
            amplitude *
            0.12;
          const y = center + offset + wave + detail;
          if (x === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();
      }
      context.globalAlpha = 1;
      frame += 1;
      if (!reducedMotion && frame < 90) {
        animationFrame = window.requestAnimationFrame(drawLines);
      }
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

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    if (reducedMotion) drawLines(0);
    else animationFrame = window.requestAnimationFrame(drawLines);
    dismissTimer = window.setTimeout(() => void dismiss(), reducedMotion ? 650 : 1750);
    const skipButton = root.querySelector("button");
    const skipHandler = () => void dismiss();
    skipButton?.addEventListener("click", skipHandler);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(dismissTimer);
      window.removeEventListener("resize", resizeCanvas);
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
      <button className={styles.skip} type="button" data-magnetic>Skip intro</button>
    </div>
  );
}
