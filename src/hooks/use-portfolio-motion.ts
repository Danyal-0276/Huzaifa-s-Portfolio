"use client";

import { useEffect, type RefObject } from "react";

export function usePortfolioMotion<T extends HTMLElement>(
  rootRef: RefObject<T | null>,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cancelled = false;
    let revertAnime: (() => void) | undefined;
    let revertGsap: (() => void) | undefined;
    let observer: IntersectionObserver | undefined;
    let removeAsciiListeners: (() => void) | undefined;

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
              const element = entry.target as HTMLElement;
              scope.add(() => {
                animate(element, {
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

        const glitchTargets = [...root.querySelectorAll<HTMLElement>("[data-ascii-ripple]")];
        const glitchCharacters = "!<>/\\|{}[]*+=~^_?:;";
        const accent = getComputedStyle(root).getPropertyValue("--color-accent").trim() || "#E04E24";
        const listeners: Array<() => void> = [];

        glitchTargets.forEach((target) => {
          const playRipple = (originX?: number) => {
            const bounds = target.getBoundingClientRect();
            const pointerX = originX ?? bounds.left + bounds.width / 2;
            const maxDistance = Math.max(bounds.width / 2, 1);
            const chars = target.querySelectorAll<HTMLElement>("[data-glyph]");

            chars.forEach((character) => {
              const original = character.dataset.glyph ?? character.textContent ?? "";
              const charBounds = character.getBoundingClientRect();
              const distance = Math.abs(charBounds.left + charBounds.width / 2 - pointerX);
              const delay = (distance / maxDistance) * 260;
              const originalColor = getComputedStyle(character).color;

              scope.add(() => {
                animate(character, {
                  translateY: [0, -3, 0],
                  rotate: [0, Math.random() * 8 - 4, 0],
                  color: [accent, originalColor],
                  delay,
                  duration: 560,
                  ease: "out(3)",
                  onBegin: () => {
                    character.textContent = glitchCharacters[Math.floor(Math.random() * glitchCharacters.length)];
                  },
                  onComplete: () => {
                    character.textContent = original;
                  },
                });
              });
            });
          };

          const onPointerEnter = (event: PointerEvent) => playRipple(event.clientX);
          const onFocus = () => playRipple();
          target.addEventListener("pointerenter", onPointerEnter);
          target.addEventListener("focus", onFocus);
          listeners.push(() => {
            target.removeEventListener("pointerenter", onPointerEnter);
            target.removeEventListener("focus", onFocus);
          });
        });
        removeAsciiListeners = () => listeners.forEach((remove) => remove());

        const floatCard = root.querySelector("[data-float]");
        if (floatCard) {
          animate(floatCard, {
            translateY: [0, -13],
            rotate: ["2deg", "-1.5deg"],
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

        if (window.innerWidth > 720) {
          root.querySelectorAll("[data-card-tilt]").forEach((panel, index) => {
            gsap.fromTo(
              panel,
              { scale: 1.035, rotationZ: index % 2 === 0 ? 1.6 : -1.6 },
              {
                scale: 0.975,
                rotationZ: index % 2 === 0 ? -0.5 : 0.5,
                ease: "none",
                scrollTrigger: {
                  trigger: panel,
                  start: "top bottom",
                  end: "center center",
                  scrub: 0.8,
                },
              },
            );
          });
        }
      }, root);
      revertGsap = () => gsapContext.revert();
    };

    void setup();

    return () => {
      cancelled = true;
      observer?.disconnect();
      removeAsciiListeners?.();
      revertAnime?.();
      revertGsap?.();
    };
  }, [rootRef]);
}
