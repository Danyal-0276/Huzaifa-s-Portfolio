"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  videoCaseStudies,
  videoGalleryProjects,
  type VideoProject,
} from "@/features/portfolio/data/video-projects";
import styles from "./portfolio-page.module.css";

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.25 5.25v13.5L19 12 8.25 5.25Z" fill="currentColor" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 12h13m-5-5 5 5-5 5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export default function VideoShowcase() {
  const [activeProject, setActiveProject] = useState<VideoProject | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  const openProject = (
    project: VideoProject,
    event: ReactMouseEvent<HTMLButtonElement>,
  ) => {
    lastTriggerRef.current = event.currentTarget;
    setActiveProject(project);
  };

  const closeProject = () => {
    setActiveProject(null);
    window.requestAnimationFrame(() => lastTriggerRef.current?.focus());
  };

  useEffect(() => {
    if (!activeProject) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.setProperty("overflow", "hidden");

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setActiveProject(null);
        window.requestAnimationFrame(() => lastTriggerRef.current?.focus());
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), video[controls], [href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      if (previousOverflow) {
        document.body.style.setProperty("overflow", previousOverflow);
      } else {
        document.body.style.removeProperty("overflow");
      }
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeProject]);

  return (
    <>
      <section
        className={styles.videoWorkSection}
        id="video-work"
        aria-labelledby="video-work-heading"
        data-video-work-section
      >
        <div className={styles.videoWorkIntro} data-reveal>
          <div>
            <p className={styles.videoEyebrow}>VIDEO EDITING / SELECTED WORK</p>
            <h2 id="video-work-heading">
              Edits built to
              <br />
              <span>earn the next second.</span>
            </h2>
          </div>
          <p>
            Short-form stories, product-led content, and long-form explainers—
            selected for range, clarity, and finish.
          </p>
        </div>

        <div className={styles.videoCaseGrid}>
          {videoCaseStudies.map((project, index) => (
            <article
              className={`${styles.videoCaseCard} ${
                index === 0
                  ? styles.videoCaseLead
                  : index === 1
                    ? styles.videoCaseProduct
                    : styles.videoCaseWide
              }`}
              data-video-card
              key={project.id}
            >
              <button
                className={`${styles.videoCaseMedia} ${
                  project.orientation === "landscape"
                    ? styles.videoMediaLandscape
                    : styles.videoMediaPortrait
                }`}
                type="button"
                aria-label={`Play ${project.category}: ${project.title}`}
                onClick={(event) => openProject(project, event)}
              >
                <Image
                  src={project.poster}
                  alt={project.posterAlt}
                  fill
                  sizes={
                    project.orientation === "landscape"
                      ? "(max-width: 680px) 86vw, 62vw"
                      : "(max-width: 680px) 86vw, 34vw"
                  }
                />
                <span className={styles.videoMediaShade} aria-hidden="true" />
                <span className={styles.videoPlayButton} aria-hidden="true">
                  <PlayIcon />
                </span>
                <span className={styles.videoMediaMeta} aria-hidden="true">
                  <span>{project.duration}</span>
                  <span>{project.format}</span>
                </span>
              </button>

              <div className={styles.videoCaseCopy}>
                <div className={styles.videoCaseKicker}>
                  <span>0{index + 1}</span>
                  <span>{project.category}</span>
                </div>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <ul className={styles.videoFocusList} aria-label="Edit focus">
                  {project.focus.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <button
                  className={styles.videoTextButton}
                  type="button"
                  onClick={(event) => openProject(project, event)}
                >
                  Watch the edit
                  <ArrowIcon />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className={styles.videoGallerySection}
        aria-labelledby="more-video-work-heading"
        data-video-gallery-section
      >
        <div className={styles.videoGalleryIntro} data-reveal>
          <div>
            <p className={styles.videoEyebrow}>MORE SELECTED EDITS</p>
            <h2 id="more-video-work-heading">
              Different formats.
              <br />
              <span>One sharp standard.</span>
            </h2>
          </div>
          <p>
            Four concise examples of narrative pacing, visual tone, kinetic
            type, and social-first structure.
          </p>
        </div>

        <div className={styles.videoGalleryTrack}>
          {videoGalleryProjects.map((project, index) => (
            <article className={styles.videoTile} data-video-tile key={project.id}>
              <button
                className={styles.videoTileMedia}
                type="button"
                aria-label={`Play ${project.title}`}
                onClick={(event) => openProject(project, event)}
              >
                <Image
                  src={project.poster}
                  alt={project.posterAlt}
                  fill
                  sizes="(max-width: 680px) 72vw, (max-width: 980px) 42vw, 23vw"
                />
                <span className={styles.videoTileShade} aria-hidden="true" />
                <span className={styles.videoTileIndex} aria-hidden="true">
                  0{index + 1}
                </span>
                <span className={styles.videoTilePlay} aria-hidden="true">
                  <PlayIcon />
                </span>
                <span className={styles.videoTileDuration} aria-hidden="true">
                  {project.duration}
                </span>
              </button>
              <div className={styles.videoTileCopy}>
                <p>{project.category}</p>
                <h3>{project.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      {activeProject ? (
        <div
          className={styles.videoModalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeProject();
          }}
        >
          <div
            className={styles.videoModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="video-modal-title"
            aria-describedby="video-modal-description"
            ref={dialogRef}
          >
            <div className={styles.videoModalHeader}>
              <div>
                <span>{activeProject.category}</span>
                <h2 id="video-modal-title">{activeProject.title}</h2>
              </div>
              <button
                className={styles.videoModalClose}
                type="button"
                aria-label="Close video player"
                autoFocus
                onClick={closeProject}
              >
                <span aria-hidden="true" />
                <span aria-hidden="true" />
              </button>
            </div>

            <div
              className={`${styles.videoPlayerFrame} ${
                activeProject.orientation === "portrait"
                  ? styles.videoPlayerPortrait
                  : styles.videoPlayerLandscape
              }`}
            >
              <video
                key={activeProject.source}
                width={activeProject.width}
                height={activeProject.height}
                poster={activeProject.poster}
                controls
                autoPlay
                playsInline
                preload="metadata"
                aria-label={`${activeProject.category}: ${activeProject.title}`}
              >
                <source src={activeProject.source} type="video/mp4" />
                Your browser does not support HTML video playback.
              </video>
            </div>

            <div className={styles.videoModalFooter}>
              <p id="video-modal-description">{activeProject.summary}</p>
              <span>
                {activeProject.duration} · {activeProject.format}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
