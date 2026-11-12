"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./stats-counter.module.css";

export type StatsCounterProps = {
  value: number;
  suffix?: string;
  duration?: number;
  locale?: string;
  className?: string;
};

export default function StatsCounter({
  value,
  suffix = "",
  duration = 2,
  locale = "en",
  className,
}: StatsCounterProps) {
  const counterRef = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const formattedValue = new Intl.NumberFormat(locale).format(value);

  useEffect(() => {
    const element = counterRef.current;
    if (!element) return;

    let frameId = 0;
    let observer: IntersectionObserver | undefined;
    let started = false;

    const start = () => {
      if (started) return;
      started = true;
      observer?.disconnect();

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion || duration <= 0) {
        setCount(value);
        return;
      }

      const startTime = performance.now();
      const durationMs = duration * 1000;

      const tick = (now: number) => {
        const progress = Math.min((now - startTime) / durationMs, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(value * easedProgress));

        if (progress < 1) {
          frameId = window.requestAnimationFrame(tick);
        }
      };

      frameId = window.requestAnimationFrame(tick);
    };

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) start();
        },
        { threshold: 0.25 },
      );
      observer.observe(element);
    } else {
      start();
    }

    return () => {
      observer?.disconnect();
      window.cancelAnimationFrame(frameId);
    };
  }, [duration, value]);

  const combinedClassName = [styles.counter, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      ref={counterRef}
      className={combinedClassName}
      aria-label={`${formattedValue}${suffix}`}
    >
      <span aria-hidden="true">
        {new Intl.NumberFormat(locale).format(count)}{suffix}
      </span>
    </span>
  );
}
