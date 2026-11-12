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
    let timelineObserver: IntersectionObserver | undefined;
    let removeAsciiListeners: (() => void) | undefined;

    const setup = async () => {
      const [{ animate, createScope, createTimeline, stagger }, { gsap }, { ScrollTrigger }] =
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
              scope?.add(() => {
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

        const experienceList = root.querySelector<HTMLElement>("[data-experience-timeline]");
        const experienceSection = root.querySelector<HTMLElement>("[data-experience-section]");
        const experienceLine = root.querySelector("[data-experience-line]");
        const experienceMarkers = [...root.querySelectorAll<HTMLElement>("[data-experience-marker]")];
        const experienceEntries = [...root.querySelectorAll<HTMLElement>("[data-experience-entry]")];

        if (experienceList && experienceSection && experienceLine && experienceEntries.length) {
          const timeline = createTimeline({ autoplay: false });
          timeline
            .add(experienceLine, {
              scaleY: [0, 1],
              duration: 1400,
              ease: "out(3)",
            }, 0)
            .add(experienceMarkers, {
              scale: [0, 1],
              opacity: [0, 1],
              duration: 480,
              delay: stagger(150),
              ease: "out(4)",
            }, 240)
            .add(experienceEntries, {
              opacity: [0, 1],
              translateY: [26, 0],
              duration: 760,
              delay: stagger(180),
              ease: "out(3)",
            }, 380);

          experienceList.dataset.timelineReady = "true";
          if ("IntersectionObserver" in window) {
            timelineObserver = new IntersectionObserver(
              ([entry]) => {
                if (!entry.isIntersecting) return;
                timelineObserver?.disconnect();
                timeline.play();
              },
              { threshold: 0.18 },
            );
            timelineObserver.observe(experienceSection);
          } else {
            timeline.play();
          }
        }

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

              scope?.add(() => {
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

        root.querySelectorAll<HTMLElement>("[data-swing]").forEach((panel, index) => {
          const amount = index === 0 ? 4 : index === 1 ? 2.5 : 1.4;
          animate(panel, {
            rotate: [amount, -amount],
            translateY: [0, index === 2 ? -5 : 5],
            duration: 3600 + index * 370,
            delay: index * 140,
            ease: "inOut(2)",
            alternate: true,
            loop: true,
          });
        });

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
      const removeGsapListeners: Array<() => void> = [];
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
            scale: 0.76,
            transformOrigin: "center center",
            ease: "none",
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom top",
              scrub: 1.2,
            },
          });
        }

        const heroHeading = root.querySelector("[data-hero-heading]");
        if (heroHeading) {
          gsap.fromTo(
            heroHeading,
            { y: 22, clipPath: "inset(0 0 100% 0)" },
            { y: 0, clipPath: "inset(0 0 0% 0)", duration: 1.15, delay: 0.2, ease: "power3.out" },
          );
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

        root.querySelectorAll<HTMLElement>("[data-image-motion]").forEach((image) => {
          const trigger = image.closest("[data-reveal]") ?? image.parentElement ?? image;
          gsap.fromTo(
            image,
            { scale: 1.08, yPercent: 3 },
            {
              scale: 1,
              yPercent: -3,
              ease: "none",
              scrollTrigger: {
                trigger,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            },
          );
        });

        root.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((element) => {
          const moveX = gsap.quickTo(element, "x", { duration: 0.35, ease: "power3.out" });
          const moveY = gsap.quickTo(element, "y", { duration: 0.35, ease: "power3.out" });
          const onMove = (event: PointerEvent) => {
            if (event.pointerType === "touch") return;
            const bounds = element.getBoundingClientRect();
            moveX((event.clientX - bounds.left - bounds.width / 2) * 0.12);
            moveY((event.clientY - bounds.top - bounds.height / 2) * 0.14);
          };
          const onLeave = () => {
            moveX(0);
            moveY(0);
          };
          element.addEventListener("pointermove", onMove);
          element.addEventListener("pointerleave", onLeave);
          removeGsapListeners.push(() => {
            element.removeEventListener("pointermove", onMove);
            element.removeEventListener("pointerleave", onLeave);
          });
        });
      }, root);
      revertGsap = () => {
        removeGsapListeners.forEach((remove) => remove());
        gsapContext.revert();
      };
    };

    void setup();

    return () => {
      cancelled = true;
      observer?.disconnect();
      timelineObserver?.disconnect();
      removeAsciiListeners?.();
      revertAnime?.();
      revertGsap?.();
    };
  }, [rootRef]);
}
