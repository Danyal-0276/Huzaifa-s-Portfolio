"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import AsciiRippleText from "@/components/ui/ascii-ripple-text";
import LightLinesIntro from "@/components/ui/light-lines-intro";
import StatsCounter from "@/components/ui/stats-counter";
import { usePortfolioMotion } from "@/hooks/use-portfolio-motion";
import styles from "./portfolio-page.module.css";

const services = [
  {
    number: "01",
    title: "Prospect research",
    detail: "Define target markets and build focused lists of qualified B2B prospects.",
    icon: "⌕",
  },
  {
    number: "02",
    title: "Lead generation",
    detail: "Find and qualify opportunities through LinkedIn, email, and market research.",
    icon: "↗",
  },
  {
    number: "03",
    title: "Outbound campaigns",
    detail: "Plan tailored outreach and follow-up sequences that start useful conversations.",
    icon: "✳",
  },
  {
    number: "04",
    title: "Sales pipeline support",
    detail: "Keep CRM records clear, track conversion activity, and move promising leads forward.",
    icon: "◇",
  },
];

const tools = [
  "Apollo",
  "ZoomInfo",
  "Crunchbase",
  "LinkedIn",
  "Sales Navigator",
  "Instantly AI",
  "HubSpot",
  "Upwork",
  "Fiverr",
  "Excel",
  "Grok AI",
];

function PipelineArtwork({ kind }: { kind: "research" | "outreach" | "pipeline" }) {
  if (kind === "research") {
    return (
      <div className={`${styles.workflowArt} ${styles.researchArt}`} data-card-tilt aria-hidden="true">
        <div className={styles.researchRadar}><i /><i /><i /><b>ICP</b></div>
        <div className={styles.researchCard}><span>MARKET MAP</span><b>Find the right fit.</b><i /><i /><i /></div>
        <div className={styles.researchNote}>COMPANY · ROLE · NEED</div>
      </div>
    );
  }

  if (kind === "outreach") {
    return (
      <div className={`${styles.workflowArt} ${styles.outreachArt}`} data-card-tilt aria-hidden="true">
        <div className={styles.messageCard}>
          <div className={styles.messageTop}><i /><i /><i /><span>OUTREACH NOTE</span></div>
          <b>A relevant first hello.</b>
          <i /><i /><i />
          <div className={styles.messageReply}>FOLLOW-UP ↗</div>
        </div>
        <div className={styles.outreachOrb} />
      </div>
    );
  }

  return (
    <div className={`${styles.workflowArt} ${styles.pipelineArt}`} data-card-tilt aria-hidden="true">
      <div className={styles.pipelineColumns}>
        <div><span>NEW</span><i /><i /></div>
        <div><span>IN PROGRESS</span><i /><i /></div>
        <div><span>QUALIFIED</span><i /></div>
      </div>
      <div className={styles.pipelineLine} />
      <b>Clear next steps.</b>
    </div>
  );
}

export default function PortfolioPage() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  usePortfolioMotion(rootRef);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={styles.site} ref={rootRef}>
      <LightLinesIntro />
      <a className={styles.skipLink} href="#main-content">Skip to content</a>

      <header className={`${styles.header} ${menuOpen ? styles.headerMenuOpen : ""}`}>
        <a className={styles.brandImage} href="#home" aria-label="Muhammad Huzaifa Ali, home" onClick={closeMenu}>
          <Image src="/images/huzaifa-wordmark.png" alt="Huzaifa" width={2059} height={239} priority />
        </a>
        <nav className={styles.desktopNav} aria-label="Main navigation">
          <a href="#home">Home</a><a href="#about">About</a><a href="#services">Services</a><a href="#experience">Experience</a><a href="#contact">Contact</a>
        </nav>
        <button
          className={`${styles.menuButton} ${menuOpen ? styles.menuButtonOpen : ""}`}
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="full-screen-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span />
        </button>
      </header>

      <div className={`${styles.menuOverlay} ${menuOpen ? styles.menuOverlayOpen : ""}`} id="full-screen-menu" aria-hidden={!menuOpen}>
        <nav aria-label="Full screen navigation">
          {[
            ["Home", "home"],
            ["About", "about"],
            ["Services", "services"],
            ["Experience", "experience"],
            ["Education", "education"],
            ["Contact", "contact"],
          ].map(([label, target], index) => (
            <a href={`#${target}`} key={target} onClick={closeMenu}>
              <span>0{index + 1}</span>{label}<b>↗</b>
            </a>
          ))}
        </nav>
        <div className={styles.menuFoot}><a href="mailto:huzaifajutt853@gmail.com">LET'S TALK ↗</a><span>LAHORE, PAKISTAN</span></div>
      </div>

      <main id="main-content">
        <section className={styles.hero} id="home" data-hero>
          <div className={styles.heroGrid} aria-hidden="true" />
          <div className={styles.heroWatermark} data-parallax="watermark" aria-hidden="true">HUZAIFA</div>
          <div className={styles.heroPortrait} data-parallax="portrait" aria-label="Portraits of Muhammad Huzaifa Ali">
            <div className={`${styles.portraitPanel} ${styles.portraitPanelBack}`} data-swing>
              <Image src="/images/huzaifa-profile-dark.png" alt="Huzaifa in profile against a dark background" fill sizes="(max-width: 680px) 45vw, 28vw" priority />
            </div>
            <div className={`${styles.portraitPanel} ${styles.portraitPanelMiddle}`} data-swing>
              <Image src="/images/huzaifa-profile-light.png" alt="Huzaifa looking ahead in profile" fill sizes="(max-width: 680px) 50vw, 30vw" priority />
            </div>
            <div className={`${styles.portraitPanel} ${styles.portraitPanelFront}`} data-swing>
              <Image src="/images/huzaifa-portrait.png" alt="Muhammad Huzaifa Ali" fill sizes="(max-width: 680px) 68vw, 38vw" priority />
            </div>
          </div>
          <div className={styles.heroCopy} data-reveal>
            <h1>Find the right people.<br /><span><AsciiRippleText text="Start real conversations." /></span></h1>
            <p className={styles.heroRole}>B2B lead generation &amp; business development</p>
            <p className={styles.heroText}>I help teams research their market, reach qualified prospects, and turn promising conversations into client relationships.</p>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="#services">Explore how I work <span>↗</span></a>
              <a className={styles.heroSecondary} href="mailto:huzaifajutt853@gmail.com">Get in touch</a>
            </div>
          </div>
          <a className={styles.heroProject} href="#services" data-float aria-label="See the lead generation workflow">
            <div className={styles.heroProjectVisual}>
              <div className={styles.projectCardTitle}>Research.<br />Reach. Follow through.</div>
              <div className={styles.projectCardRows}><span>Market research <b>↗</b></span><span>Qualified prospects <b>↗</b></span><span>Personalized outreach <b>↗</b></span></div>
            </div>
            <div className={styles.projectFooter}><strong><i /> HUZAIFA ALI</strong><span>/Business Development</span></div>
          </a>
        </section>

        <section className={styles.aboutSection} id="about">
          <div className={styles.aboutGrid}>
            <div className={styles.aboutPortraitWrap} data-reveal>
              <div className={styles.cornerFrame}><span /><span /><span /><span /></div>
              <div className={styles.aboutPortrait}>
                <Image src="/images/huzaifa-profile-light.png" alt="Muhammad Huzaifa Ali" fill sizes="(max-width: 680px) 75vw, 34vw" />
              </div>
            </div>
            <div className={styles.aboutCopy}>
              <div className={styles.aboutHeadingRow} data-reveal>
                <h2>Good growth begins with<br /><span>good conversations.</span></h2>
                <span className={styles.aboutAsterisk} data-spin aria-hidden="true">✳</span>
              </div>
              <p className={styles.aboutIntro}>I’m Muhammad Huzaifa Ali, a business development executive and lead generation specialist based in Lahore, Pakistan.</p>
              <p className={styles.aboutBody}>For the past two years, I’ve helped multiple clients research target markets, build qualified prospect lists, and run LinkedIn and email outreach. I write tailored proposals, manage sales pipelines, and focus on turning a good first conversation into a lasting client relationship.</p>
              <p className={styles.aboutBody}>My freelance journey also included some video editing work. Today, I’m pursuing a BS in Computer Science at Green International University, bringing a technical perspective to the way I approach business growth.</p>
              <div className={styles.statsGrid}>
                <article className={styles.statCard} data-reveal>
                  <div className={styles.statNumber}><StatsCounter value={2} suffix="+" duration={1.7} /></div>
                  <h3>Years in business development</h3><p>Freelance lead generation and client acquisition.</p>
                </article>
                <article className={styles.statCard} data-reveal>
                  <div className={styles.statNumber}><StatsCounter value={2} duration={1.8} /></div>
                  <h3>Contracts signed</h3><p>Won through freelance outreach and proposals.</p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.servicesSection} id="services">
          <div className={styles.servicesIntro} data-reveal>
            <h2>From first search<br />to <span>signed work.</span></h2>
            <p>Practical support for teams that want a clearer path from prospecting to new clients.</p>
          </div>
          <div className={styles.serviceList}>
            {services.map((service) => (
              <article className={styles.serviceRow} key={service.number} data-reveal>
                <span className={styles.serviceNumber}>{service.number}</span>
                <h3>{service.title}</h3><p>{service.detail}</p><span className={styles.serviceIcon} aria-hidden="true">{service.icon}</span>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.workflowSection}>
          <div className={styles.workflowIntro} data-reveal>
            <h2>Build a pipeline<br /><span>with purpose.</span></h2>
            <p>Research and outreach work best when every step is focused, relevant, and easy to follow up.</p>
          </div>
          <div className={styles.workflowGrid}>
            <article className={styles.workflowCard} data-reveal>
              <PipelineArtwork kind="research" />
              <h3>Know who to reach</h3><p>Market research, ideal customer profiles, competitor analysis, and carefully built prospect lists.</p>
            </article>
            <article className={styles.workflowCard} data-reveal>
              <PipelineArtwork kind="outreach" />
              <h3>Make the first message matter</h3><p>Personalized LinkedIn and email outreach with consistent qualification and follow-up.</p>
            </article>
            <article className={styles.workflowCard} data-reveal>
              <PipelineArtwork kind="pipeline" />
              <h3>Keep good opportunities moving</h3><p>Tailored proposals, clean CRM records, and clear pipeline and conversion tracking.</p>
            </article>
          </div>
        </section>

        <section className={styles.experienceSection} id="experience">
          <div className={styles.experienceIntro} data-reveal>
            <h2>Experience built<br />through <span>real client work.</span></h2>
            <p>Freelance campaigns, client acquisition, and hands-on business development.</p>
          </div>
          <div className={styles.experienceList}>
            <article className={styles.experienceItem} data-reveal>
              <div className={styles.experienceDate}>2024 — PRESENT</div>
              <div><h3>Freelance Business Development Executive</h3><p className={styles.experienceCompany}>Upwork &amp; LinkedIn · Remote</p>
                <ul><li>Plan and run outbound lead generation campaigns for multiple clients.</li><li>Research target markets and build qualified prospect lists with LinkedIn Sales Navigator.</li><li>Write tailored proposals and pitches, manage sales pipelines, and track conversion activity.</li><li>Optimize client LinkedIn and Upwork profiles and nurture relationships that lead to repeat work.</li></ul>
              </div>
              <span className={styles.experienceArrow} aria-hidden="true">↗</span>
            </article>
            <article className={styles.experienceItem} data-reveal>
              <div className={styles.experienceDate}>JULY — SEPTEMBER 2026</div>
              <div><h3>Business Development Intern</h3><p className={styles.experienceCompany}>Octacer · Digital Services</p>
                <ul><li>Generated qualified leads through targeted outreach and market analysis.</li><li>Prepared proposals and presentations and supported growth opportunity research.</li><li>Built early relationships with prospects and clients in digital services.</li></ul>
              </div>
              <span className={styles.experienceArrow} aria-hidden="true">↗</span>
            </article>
          </div>
        </section>

        <section className={styles.toolsSection}>
          <div className={styles.toolsIntro} data-reveal>
            <h2>The right tools<br />for <span>the right reach.</span></h2>
            <p>Platforms I’ve used for prospect research, outreach, client work, and reporting.</p>
          </div>
          <div className={styles.toolCloud}>
            {tools.map((tool) => <span key={tool}>{tool}</span>)}
          </div>
        </section>

        <section className={styles.educationSection} id="education">
          <div className={styles.educationCopy} data-reveal>
            <h2>Business in practice.<br /><span>Computer science in study.</span></h2>
            <div className={styles.educationDegree}><span>2023 — 2027</span><h3>BS Computer Science</h3><p>Green International University · Lahore, Pakistan</p></div>
            <p className={styles.educationNote}>A four-year, eight-semester degree program that complements my work in research, systems, and digital business.</p>
            <a className={styles.textLink} href="https://giu.edu.pk/course-detail/bs-computer-sciences" target="_blank" rel="noreferrer">Explore the GIU Computer Science program <span>↗</span></a>
          </div>
          <div className={styles.educationPhotos} data-reveal>
            <div className={styles.universityBanner}><Image src="/images/giu-main-banner.webp" alt="Green International University campus in Lahore" fill sizes="(max-width: 800px) 100vw, 48vw" /></div>
            <div className={styles.universityBuilding}><Image src="/images/giu-building.webp" alt="Green International University building" fill sizes="(max-width: 800px) 45vw, 22vw" /></div>
          </div>
        </section>
      </main>

      <footer className={styles.footer} id="contact">
        <div className={styles.footerTop}>
          <div className={styles.footerBio}>
            <h2>Let’s start<br /><span>a conversation.</span></h2>
            <p>Available for remote business development and lead generation work with teams looking to build meaningful client relationships.</p>
            <a className={styles.footerEmail} href="mailto:huzaifajutt853@gmail.com">huzaifajutt853@gmail.com <span>↗</span></a>
          </div>
          <div className={styles.footerSide}>
            <div className={styles.contactCard}>
              <a href="tel:+923323300702"><span>PHONE</span>+92 332 3300702 <b>↗</b></a>
              <a href="https://www.linkedin.com/in/muhammad-huzaifa-ali-075a212a2/" target="_blank" rel="noreferrer"><span>LINKEDIN</span>Muhammad Huzaifa Ali <b>↗</b></a>
              <a href="mailto:huzaifajutt853@gmail.com"><span>EMAIL</span>Send an email <b>↗</b></a>
            </div>
            <div className={styles.footerLinks}>
              <div><span>LINKEDIN</span><a href="https://www.linkedin.com/in/muhammad-huzaifa-ali-075a212a2/" target="_blank" rel="noreferrer">Muhammad Huzaifa Ali ↗</a></div>
              <div><span>ON THIS PAGE</span><a href="#services">Services</a><a href="#experience">Experience</a><a href="#education">Education</a></div>
            </div>
          </div>
        </div>
        <div className={styles.footerWordmark}>Huzaifa<span>®</span></div>
        <div className={styles.footerBar}><span>© {new Date().getFullYear()} MUHAMMAD HUZAIFA ALI</span><a href="#home">BACK TO TOP ↑</a><span>LAHORE, PAKISTAN</span></div>
      </footer>
    </div>
  );
}
