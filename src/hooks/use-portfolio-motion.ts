"use client";

import { useEffect, type RefObject } from "react";

export function usePortfolioMotion<T extends HTMLElement>(
  rootRef: RefObject<T | null>,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (
      !root ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
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

        const glitchTargets = [
          ...root.querySelectorAll<HTMLElement>("[data-ascii-ripple]"),
        ];
        const glitchCharacters = "!<>/\\|{}[]*+=~^_?:;";
        const accent =
          getComputedStyle(root).getPropertyValue("--color-accent").trim() ||
          "#E04E24";
        const listeners: Array<() => void> = [];

        glitchTargets.forEach((target) => {
          const playRipple = (originX?: number) => {
            const bounds = target.getBoundingClientRect();
            const pointerX = originX ?? bounds.left + bounds.width / 2;
            const maxDistance = Math.max(bounds.width / 2, 1);
            const chars = target.querySelectorAll<HTMLElement>("[data-glyph]");

            chars.forEach((character) => {
              const original =
                character.dataset.glyph ?? character.textContent ?? "";
              const charBounds = character.getBoundingClientRect();
              const distance = Math.abs(
                charBounds.left + charBounds.width / 2 - pointerX,
              );
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
                    character.textContent =
                      glitchCharacters[
                        Math.floor(Math.random() * glitchCharacters.length)
                      ];
                  },
                  onComplete: () => {
                    character.textContent = original;
                  },
                });
              });
            });
          };

          const onPointerEnter = (event: PointerEvent) =>
            playRipple(event.clientX);
          const onFocus = () => playRipple();
          target.addEventListener("pointerenter", onPointerEnter);
          target.addEventListener("focus", onFocus);
          listeners.push(() => {
            target.removeEventListener("pointerenter", onPointerEnter);
            target.removeEventListener("focus", onFocus);
          });
        });
        removeAsciiListeners = () => listeners.forEach((remove) => remove());

        root
          .querySelectorAll<HTMLElement>("[data-swing]")
          .forEach((panel, index) => {
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
        const siteHeader =
          root.querySelector<HTMLElement>("[data-site-header]");
        if (siteHeader) {
          siteHeader.dataset.scrolled = String(window.scrollY > 64);
          ScrollTrigger.create({
            start: 64,
            onEnter: () => {
              siteHeader.dataset.scrolled = "true";
            },
            onLeaveBack: () => {
              siteHeader.dataset.scrolled = "false";
            },
          });
        }

        const servicesSection = root.querySelector<HTMLElement>(
          "[data-services-section]",
        );
        const serviceRows =
          root.querySelectorAll<HTMLElement>("[data-service-row]");
        const serviceQuote = root.querySelector<HTMLElement>(
          "[data-service-quote]",
        );
        if (servicesSection && serviceRows.length) {
          serviceRows.forEach((row, index) => {
            const copy = row.querySelectorAll<HTMLElement>(
              "[data-service-copy]",
            );
            const number = row.querySelector<HTMLElement>(
              "[data-service-number]",
            );
            const icon = row.querySelector<HTMLElement>("[data-service-icon]");
            const rowTimeline = gsap.timeline({
              scrollTrigger: {
                trigger: row,
                start: "top 96%",
                end: "top 60%",
                scrub: 0.55,
                invalidateOnRefresh: true,
              },
            });

            rowTimeline
              .fromTo(
                row,
                { autoAlpha: 0, y: 34, clipPath: "inset(0 0 100% 0)" },
                {
                  autoAlpha: 1,
                  y: 0,
                  clipPath: "inset(0 0 0% 0)",
                  duration: 0.8,
                  ease: "power3.out",
                },
                0,
              )
              .fromTo(
                copy,
                { x: -20, autoAlpha: 0 },
                {
                  x: 0,
                  autoAlpha: 1,
                  duration: 0.45,
                  stagger: 0.08,
                  ease: "power2.out",
                },
                0.16,
              );

            if (number) {
              rowTimeline.fromTo(
                number,
                { scale: 0.65, autoAlpha: 0, color: "#8c8b84" },
                {
                  scale: 1,
                  autoAlpha: 1,
                  color: "#E04E24",
                  duration: 0.42,
                  ease: "back.out(2)",
                },
                0.12,
              );
            }

            if (icon) {
              rowTimeline.fromTo(
                icon,
                { rotation: -35, scale: 0.5, autoAlpha: 0 },
                {
                  rotation: 0,
                  scale: 1,
                  autoAlpha: 1,
                  duration: 0.42,
                  ease: "back.out(2)",
                },
                0.2 + index * 0.015,
              );
            }
          });

          if (serviceQuote) {
            gsap.fromTo(
              serviceQuote,
              { y: 60, autoAlpha: 0, clipPath: "inset(0 0 20% 0)" },
              {
                y: 0,
                autoAlpha: 1,
                clipPath: "inset(0 0 0% 0)",
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: serviceQuote,
                  start: "top 94%",
                  end: "top 62%",
                  scrub: 0.6,
                },
              },
            );
          }
        }

        const educationSection = root.querySelector<HTMLElement>("#education");
        const educationBackground = root.querySelector<HTMLElement>(
          "[data-education-parallax]",
        );
        if (educationSection && educationBackground) {
          gsap.fromTo(
            educationBackground,
            { scale: 1.12, yPercent: -5 },
            {
              scale: 1.12,
              yPercent: 5,
              ease: "none",
              scrollTrigger: {
                trigger: educationSection,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
                invalidateOnRefresh: true,
              },
            },
          );
        }

        const footer = root.querySelector<HTMLElement>("#contact");
        const footerCta = root.querySelector<HTMLElement>("[data-footer-cta]");
        const footerLines =
          root.querySelectorAll<HTMLElement>("[data-footer-line]");
        const footerCircle =
          root.querySelector<HTMLElement>(".footerCircleCta");
        const footerContactGrid = root.querySelector<HTMLElement>(
          "[data-footer-contact-grid]",
        );
        if (footer && footerCta && footerLines.length) {
          const footerTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: footerCta,
              start: "top 78%",
              end: "bottom 28%",
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          });

          footerTimeline.fromTo(
            footerLines,
            { yPercent: 110, autoAlpha: 0, rotateX: -12 },
            {
              yPercent: 0,
              autoAlpha: 1,
              rotateX: 0,
              duration: 1,
              stagger: 0.18,
              ease: "power3.out",
            },
            0,
          );

          if (footerCircle) {
            footerTimeline.fromTo(
              footerCircle,
              { scale: 0.72, rotation: -35 },
              { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.8)" },
              0.25,
            );
          }
        }

        if (footer && footerContactGrid) {
          gsap.fromTo(
            footerContactGrid.children,
            { y: 48, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              stagger: 0.15,
              ease: "power2.out",
              scrollTrigger: {
                trigger: footerContactGrid,
                start: "top 82%",
                end: "center 58%",
                scrub: 0.75,
              },
            },
          );
        }

        const experienceList = root.querySelector<HTMLElement>(
          "[data-experience-timeline]",
        );
        const experienceSection = root.querySelector<HTMLElement>(
          "[data-experience-section]",
        );
        const experienceLine = root.querySelector<HTMLElement>(
          "[data-experience-line]",
        );
        const experienceMarkers = root.querySelectorAll<HTMLElement>(
          "[data-experience-marker]",
        );
        const experienceEntries = root.querySelectorAll<HTMLElement>(
          "[data-experience-entry]",
        );
        const experienceCopy = root.querySelectorAll<HTMLElement>(
          "[data-experience-copy]",
        );

        if (
          experienceList &&
          experienceSection &&
          experienceLine &&
          experienceEntries.length
        ) {
          experienceList.dataset.timelineReady = "true";
          gsap
            .timeline({
              scrollTrigger: {
                trigger: experienceSection,
                start: "top 76%",
                end: "bottom 38%",
                scrub: 0.85,
                invalidateOnRefresh: true,
              },
            })
            .fromTo(
              experienceLine,
              { scaleY: 0 },
              { scaleY: 1, duration: 1.45, ease: "none" },
              0,
            )
            .fromTo(
              experienceEntries,
              { autoAlpha: 0, y: 42 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.72,
                stagger: 0.34,
                ease: "power3.out",
              },
              0.12,
            )
            .fromTo(
              experienceMarkers,
              { autoAlpha: 0, scale: 0 },
              {
                autoAlpha: 1,
                scale: 1,
                duration: 0.42,
                stagger: 0.36,
                ease: "back.out(2)",
              },
              0.16,
            )
            .fromTo(
              experienceCopy,
              { autoAlpha: 0, y: 18 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.42,
                stagger: 0.045,
                ease: "power2.out",
              },
              0.38,
            );
        }

        const workflowSection = root.querySelector<HTMLElement>(
          "[data-workflow-section]",
        );
        const signalMap = root.querySelector<HTMLElement>("[data-signal-map]");
        const signalNodes =
          root.querySelectorAll<HTMLElement>("[data-signal-node]");
        const signalCore =
          root.querySelector<HTMLElement>("[data-signal-core]");
        const signalRoutes = root.querySelectorAll<SVGPathElement>(
          "[data-signal-route]",
        );
        if (workflowSection && signalMap) {
          gsap.fromTo(
            signalNodes,
            { autoAlpha: 0, y: 34, scale: 0.96 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              stagger: 0.16,
              ease: "power3.out",
              scrollTrigger: {
                trigger: signalMap,
                start: "top 78%",
                once: true,
              },
            },
          );
          if (signalCore) {
            gsap.fromTo(
              signalCore,
              { autoAlpha: 0, scale: 0.72, rotate: -12 },
              {
                autoAlpha: 1,
                scale: 1,
                rotate: 0,
                duration: 1.05,
                ease: "back.out(1.7)",
                scrollTrigger: {
                  trigger: signalMap,
                  start: "top 78%",
                  once: true,
                },
              },
            );
          }
          signalRoutes.forEach((route) => {
            gsap.fromTo(
              route,
              { opacity: 0, strokeDashoffset: 36 },
              {
                opacity: 1,
                strokeDashoffset: 0,
                duration: 1.2,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: signalMap,
                  start: "top 75%",
                  once: true,
                },
              },
            );
          });
        }

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
            {
              y: 0,
              clipPath: "inset(0 0 0% 0)",
              duration: 1.15,
              delay: 0.2,
              ease: "power3.out",
            },
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

        root
          .querySelectorAll<HTMLElement>("[data-image-motion]")
          .forEach((image) => {
            const trigger =
              image.closest("[data-reveal]") ?? image.parentElement ?? image;
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

        root
          .querySelectorAll<HTMLElement>("[data-magnetic]")
          .forEach((element) => {
            const moveX = gsap.quickTo(element, "x", {
              duration: 0.35,
              ease: "power3.out",
            });
            const moveY = gsap.quickTo(element, "y", {
              duration: 0.35,
              ease: "power3.out",
            });
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
      removeAsciiListeners?.();
      revertAnime?.();
      revertGsap?.();
    };
  }, [rootRef]);
}
