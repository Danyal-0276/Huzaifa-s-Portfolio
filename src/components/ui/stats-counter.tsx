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
  const counterRef = useRef<HTMLSpanElement | null>(null);
  const [count, setCount] = useState(0);
  const formattedValue = new Intl.NumberFormat(locale).format(value);

  useEffect(() => {
    const element = counterRef.current;
    if (!element) return;

    let active = true;
    let observer: IntersectionObserver | undefined;
    let revertScope: (() => void) | undefined;

    const start = async () => {
      if (observer) observer.disconnect();

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion || duration <= 0) {
        setCount(value);
        return;
      }

      const { animate, createScope } = await import("animejs");
      if (!active) return;

      const counter = { value: 0 };
      const scope = createScope({ root: counterRef }).add(() => {
        animate(counter, {
          value,
          duration: duration * 1000,
          ease: "out(4)",
          onUpdate: () => setCount(Math.round(counter.value)),
        });
      });
      revertScope = () => scope.revert();
    };

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) void start();
        },
        { threshold: 0.35 },
      );
      observer.observe(element);
    } else {
      void start();
    }

    return () => {
      active = false;
      observer?.disconnect();
      revertScope?.();
    };
  }, [duration, value]);

  return (
    <span
      ref={counterRef}
      className={[styles.counter, className].filter(Boolean).join(" ")}
    >
      <span aria-hidden="true">
        {new Intl.NumberFormat(locale).format(count)}
        {suffix}
      </span>
      <span className={styles.srOnly}>{formattedValue}{suffix}</span>
    </span>
  );
}
