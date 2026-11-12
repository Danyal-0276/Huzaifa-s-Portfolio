"use client";

import { useEffect, type RefObject } from "react";

export function usePortfolioMotion(rootRef: RefObject<Element | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cancelled = false;
    let revertAnime: (() => void) | undefined;
    let revertGsap: (() => void) | undefined;
    let observer: IntersectionObserver | undefined;

    const setup = async () => {
      const [{ animate, createScope }, { gsap }, { ScrollTrigger }] =
        await Promise.all([
          import("animejs"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);

      if (cancelled) return;

      const animeScope = createScope({ root: rootRef }).add((scope) => {
        const reveals = root.querySelectorAll<HTMLElement>("[data-reveal]");

        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              observer?.unobserve(entry.target);
              scope.add(() => {
                animate(entry.target, {
                  opacity: [0, 1],
                  translateY: [28, 0],
                  filter: ["blur(12px)", "blur(0px)"],
                  duration: 1000,
                  ease: "out(4)",
                });
              });
            });
          },
          { threshold: 0.14, rootMargin: "0px 0px -6% 0px" },
        );

        reveals.forEach((element) => observer?.observe(element));

        const floatCard = root.querySelector("[data-float]");
        if (floatCard) {
          animate(floatCard, {
            translateY: [0, -13],
            duration: 2900,
            ease: "inOut(2)",
            alternate: true,
            loop: true,
          });
        }

        const asterisk = root.querySelector("[data-spin]");
        if (asterisk) {
          animate(asterisk, {
            rotate: "1turn",
            duration: 19000,
            ease: "linear",
            loop: true,
          });
        }
      });
      revertAnime = () => animeScope.revert();

      gsap.registerPlugin(ScrollTrigger);
      const gsapContext = gsap.context(() => {
        const hero = root.querySelector("[data-hero]");
        const portrait = root.querySelector("[data-parallax='portrait']");
        const watermark = root.querySelector("[data-parallax='watermark']");

        if (hero && portrait && window.innerWidth > 720) {
          gsap.to(portrait, {
            yPercent: 9,
            scale: 1.035,
            ease: "none",
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom top",
              scrub: 0.9,
            },
          });
        }

        if (hero && watermark && window.innerWidth > 720) {
          gsap.to(watermark, {
            yPercent: -18,
            ease: "none",
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom top",
              scrub: 1.2,
            },
          });
        }
      }, root);
      revertGsap = () => gsapContext.revert();
    };

    void setup();

    return () => {
      cancelled = true;
      observer?.disconnect();
      revertAnime?.();
      revertGsap?.();
    };
  }, [rootRef]);
}
