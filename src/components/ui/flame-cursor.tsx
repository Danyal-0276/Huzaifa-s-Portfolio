"use client";

import { useEffect, useRef } from "react";
import styles from "./flame-cursor.module.css";

const CURSOR_HOTSPOT = { x: 6, y: 5 };
const TRAIL_OFFSET = { x: 12, y: 34 };
const MAX_PARTICLES = 180;
const ACTIVE_CURSOR_CLASS = "flame-cursor-active";
const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input[type='button'], input[type='submit']";
const EDITABLE_SELECTOR =
  "input:not([type='button']):not([type='submit']), textarea, select, [contenteditable='true']";
const EMBER_COLORS = ["#fff4e8", "#ffc078", "#ff8a45", "#e04e24"];

type ParticleKind = "flame" | "ember" | "burst";

type Particle = {
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  duration: number;
  size: number;
  color: string;
  drag: number;
  gravity: number;
};

type HeatRing = {
  x: number;
  y: number;
  life: number;
  duration: number;
  startRadius: number;
  endRadius: number;
};

const randomBetween = (minimum: number, maximum: number) =>
  minimum + Math.random() * (maximum - minimum);

const closestElement = (target: EventTarget | null, selector: string) =>
  target instanceof Element ? target.closest(selector) : null;

export default function FlameCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const cursor = cursorRef.current;
    if (!canvas || !cursor) return;

    const finePointerQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let stopRuntime: (() => void) | undefined;

    const startRuntime = () => {
      const context = canvas.getContext("2d", { alpha: true });
      if (!context) return () => undefined;

      const particles: Particle[] = [];
      const heatRings: HeatRing[] = [];
      const burstTimeouts = new Set<number>();
      let animationFrame = 0;
      let pointerX = 0;
      let pointerY = 0;
      let previousX = 0;
      let previousY = 0;
      let hasPointerPosition = false;
      let pointerVisible = false;
      let lastFrameTime = performance.now();
      let lastAmbientEmber = lastFrameTime;
      let viewportWidth = window.innerWidth;
      let viewportHeight = window.innerHeight;
      let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      const trimParticles = () => {
        if (particles.length > MAX_PARTICLES) {
          particles.splice(0, particles.length - MAX_PARTICLES);
        }
      };

      const resizeCanvas = () => {
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
        pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(viewportWidth * pixelRatio);
        canvas.height = Math.round(viewportHeight * pixelRatio);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      };

      const addFlameParticle = (
        x: number,
        y: number,
        directionX: number,
        directionY: number,
      ) => {
        const duration = randomBetween(280, 500);
        particles.push({
          kind: "flame",
          x: x + randomBetween(-2.5, 2.5),
          y: y + randomBetween(-2.5, 2.5),
          vx: -directionX * randomBetween(0.8, 1.8) + randomBetween(-0.35, 0.35),
          vy:
            -directionY * randomBetween(0.8, 1.8) + randomBetween(-0.65, -0.1),
          life: duration,
          duration,
          size: randomBetween(4, 7.5),
          color: Math.random() > 0.42 ? "#e94b20" : "#ff9a55",
          drag: 0.93,
          gravity: -0.018,
        });
      };

      const addEmber = (
        x: number,
        y: number,
        directionX = 0,
        directionY = 0,
      ) => {
        const duration = randomBetween(420, 760);
        particles.push({
          kind: "ember",
          x: x + randomBetween(-3, 3),
          y: y + randomBetween(-3, 3),
          vx: -directionX * randomBetween(0.8, 2.2) + randomBetween(-0.8, 0.8),
          vy:
            -directionY * randomBetween(0.5, 1.4) + randomBetween(-1.45, -0.45),
          life: duration,
          duration,
          size: randomBetween(1, 2.4),
          color: EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)],
          drag: 0.975,
          gravity: -0.012,
        });
      };

      const emitTrail = (
        fromX: number,
        fromY: number,
        toX: number,
        toY: number,
      ) => {
        const deltaX = toX - fromX;
        const deltaY = toY - fromY;
        const distance = Math.hypot(deltaX, deltaY);
        if (distance < 4) return;

        const directionX = deltaX / distance;
        const directionY = deltaY / distance;
        const count = Math.min(6, Math.max(1, Math.floor(distance / 8)));

        for (let index = 1; index <= count; index += 1) {
          const progress = index / count;
          const x = fromX + deltaX * progress + TRAIL_OFFSET.x;
          const y = fromY + deltaY * progress + TRAIL_OFFSET.y;
          addFlameParticle(x, y, directionX, directionY);
          if (index % 2 === 0 || Math.random() > 0.68) {
            addEmber(x, y, directionX, directionY);
          }
        }
        trimParticles();
      };

      const emitClickBurst = (x: number, y: number) => {
        heatRings.push({
          x,
          y,
          life: 460,
          duration: 460,
          startRadius: 8,
          endRadius: 46,
        });

        for (let index = 0; index < 28; index += 1) {
          const angle = (Math.PI * 2 * index) / 28 + randomBetween(-0.14, 0.14);
          const speed = randomBetween(2.2, 5.7);
          const duration = randomBetween(440, 760);
          particles.push({
            kind: "burst",
            x: x + Math.cos(angle) * randomBetween(1, 5),
            y: y + Math.sin(angle) * randomBetween(1, 5),
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - randomBetween(0.15, 0.9),
            life: duration,
            duration,
            size: randomBetween(1.4, 3.3),
            color: EMBER_COLORS[index % EMBER_COLORS.length],
            drag: 0.965,
            gravity: 0.055,
          });
        }

        for (let index = 0; index < 7; index += 1) {
          addFlameParticle(
            x + randomBetween(-7, 7),
            y + randomBetween(-7, 7),
            randomBetween(-0.5, 0.5),
            randomBetween(-0.5, 0.5),
          );
        }
        trimParticles();
      };

      const hideCursor = () => {
        pointerVisible = false;
        cursor.dataset.visible = "false";
        cursor.dataset.interactive = "false";
        document.documentElement.classList.remove(ACTIVE_CURSOR_CLASS);
      };

      const showCursor = (interactive: boolean) => {
        pointerVisible = true;
        cursor.dataset.visible = "true";
        cursor.dataset.interactive = String(interactive);
        document.documentElement.classList.add(ACTIVE_CURSOR_CLASS);
      };

      const positionCursor = (x: number, y: number) => {
        cursor.style.transform = `translate3d(${x - CURSOR_HOTSPOT.x}px, ${
          y - CURSOR_HOTSPOT.y
        }px, 0)`;
      };

      const onPointerMove = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;

        pointerX = event.clientX;
        pointerY = event.clientY;
        positionCursor(pointerX, pointerY);

        if (closestElement(event.target, EDITABLE_SELECTOR)) {
          hideCursor();
          previousX = pointerX;
          previousY = pointerY;
          hasPointerPosition = true;
          return;
        }

        showCursor(Boolean(closestElement(event.target, INTERACTIVE_SELECTOR)));
        if (hasPointerPosition) {
          emitTrail(previousX, previousY, pointerX, pointerY);
        }
        previousX = pointerX;
        previousY = pointerY;
        hasPointerPosition = true;
      };

      const onPointerDown = (event: PointerEvent) => {
        if (
          event.pointerType === "touch" ||
          closestElement(event.target, EDITABLE_SELECTOR)
        ) {
          return;
        }

        emitClickBurst(event.clientX, event.clientY);
        cursor.dataset.burst = "true";
        const timeout = window.setTimeout(() => {
          delete cursor.dataset.burst;
          burstTimeouts.delete(timeout);
        }, 190);
        burstTimeouts.add(timeout);
      };

      const onVisibilityChange = () => {
        if (document.hidden) hideCursor();
      };

      const drawParticle = (particle: Particle, frameScale: number) => {
        const remaining = particle.life / particle.duration;
        const drag = Math.pow(particle.drag, frameScale);
        particle.vx *= drag;
        particle.vy = particle.vy * drag + particle.gravity * frameScale;
        particle.x += particle.vx * frameScale;
        particle.y += particle.vy * frameScale;

        context.globalAlpha = Math.min(1, remaining * 1.65);
        context.fillStyle = particle.color;
        context.strokeStyle = particle.color;
        context.shadowColor = particle.color;

        if (particle.kind === "flame") {
          const radius = particle.size * (0.25 + remaining * 0.75);
          context.shadowBlur = 13 * remaining;
          context.beginPath();
          context.ellipse(
            particle.x,
            particle.y,
            radius * 0.7,
            radius,
            Math.atan2(particle.vy, particle.vx),
            0,
            Math.PI * 2,
          );
          context.fill();
          return;
        }

        const streak = particle.kind === "burst" ? 3.2 : 2.2;
        context.shadowBlur = particle.kind === "burst" ? 10 : 7;
        context.lineWidth = Math.max(0.5, particle.size * remaining);
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(
          particle.x - particle.vx * streak,
          particle.y - particle.vy * streak,
        );
        context.stroke();
      };

      const render = (time: number) => {
        const elapsed = Math.min(42, Math.max(0, time - lastFrameTime));
        const frameScale = elapsed / (1000 / 60);
        lastFrameTime = time;
        context.clearRect(0, 0, viewportWidth, viewportHeight);
        context.save();
        context.globalCompositeOperation = "lighter";

        if (pointerVisible && time - lastAmbientEmber > 95) {
          addEmber(
            pointerX + TRAIL_OFFSET.x,
            pointerY + TRAIL_OFFSET.y,
          );
          lastAmbientEmber = time;
          trimParticles();
        }

        for (let index = particles.length - 1; index >= 0; index -= 1) {
          const particle = particles[index];
          particle.life -= elapsed;
          if (particle.life <= 0) {
            particles.splice(index, 1);
            continue;
          }
          drawParticle(particle, frameScale);
        }

        for (let index = heatRings.length - 1; index >= 0; index -= 1) {
          const ring = heatRings[index];
          ring.life -= elapsed;
          if (ring.life <= 0) {
            heatRings.splice(index, 1);
            continue;
          }

          const progress = 1 - ring.life / ring.duration;
          const radius =
            ring.startRadius + (ring.endRadius - ring.startRadius) * progress;
          context.globalAlpha = (1 - progress) * 0.72;
          context.strokeStyle = progress > 0.45 ? "#e94b20" : "#ffc078";
          context.shadowColor = "#ff7a2f";
          context.shadowBlur = 15 * (1 - progress);
          context.lineWidth = 2.4 * (1 - progress) + 0.5;
          context.beginPath();
          context.arc(ring.x, ring.y, radius, 0, Math.PI * 2);
          context.stroke();
        }

        context.restore();
        animationFrame = window.requestAnimationFrame(render);
      };

      resizeCanvas();
      animationFrame = window.requestAnimationFrame(render);
      window.addEventListener("resize", resizeCanvas, { passive: true });
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerdown", onPointerDown, { passive: true });
      window.addEventListener("blur", hideCursor);
      document.documentElement.addEventListener("pointerleave", hideCursor);
      document.addEventListener("visibilitychange", onVisibilityChange);

      return () => {
        window.cancelAnimationFrame(animationFrame);
        burstTimeouts.forEach((timeout) => window.clearTimeout(timeout));
        burstTimeouts.clear();
        particles.length = 0;
        heatRings.length = 0;
        context.clearRect(0, 0, viewportWidth, viewportHeight);
        window.removeEventListener("resize", resizeCanvas);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("blur", hideCursor);
        document.documentElement.removeEventListener("pointerleave", hideCursor);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        hideCursor();
        delete cursor.dataset.burst;
      };
    };

    const syncRuntime = () => {
      stopRuntime?.();
      stopRuntime = undefined;
      if (finePointerQuery.matches && !reducedMotionQuery.matches) {
        stopRuntime = startRuntime();
      }
    };

    syncRuntime();
    finePointerQuery.addEventListener("change", syncRuntime);
    reducedMotionQuery.addEventListener("change", syncRuntime);

    return () => {
      finePointerQuery.removeEventListener("change", syncRuntime);
      reducedMotionQuery.removeEventListener("change", syncRuntime);
      stopRuntime?.();
      document.documentElement.classList.remove(ACTIVE_CURSOR_CLASS);
    };
  }, []);

  return (
    <>
      <canvas className={styles.effects} ref={canvasRef} aria-hidden="true" />
      <div
        className={styles.cursor}
        ref={cursorRef}
        data-visible="false"
        data-interactive="false"
        aria-hidden="true"
      >
        <span className={styles.flame} />
      </div>
    </>
  );
}
