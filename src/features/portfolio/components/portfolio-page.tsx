"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
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
    icon: "•",
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

type ToolKind = "apollo" | "zoominfo" | "crunchbase" | "linkedin" | "salesnav" | "instantly" | "hubspot" | "upwork" | "fiverr" | "excel" | "grok";

const toolGroups: Array<{
  number: string;
  title: string;
  description: string;
  tools: Array<{ name: string; kind: ToolKind; focus: string }>;
}> = [
  {
    number: "01",
    title: "Prospect research",
    description: "Find the right companies and people to start with.",
    tools: [
      { name: "Apollo", kind: "apollo", focus: "Prospecting" },
      { name: "ZoomInfo", kind: "zoominfo", focus: "Company data" },
      { name: "Crunchbase", kind: "crunchbase", focus: "Market research" },
    ],
  },
  {
    number: "02",
    title: "Outreach & relationships",
    description: "Build tailored campaigns and keep conversations moving.",
    tools: [
      { name: "LinkedIn", kind: "linkedin", focus: "Networking" },
      { name: "Sales Navigator", kind: "salesnav", focus: "Lead search" },
      { name: "Instantly AI", kind: "instantly", focus: "Email outreach" },
      { name: "HubSpot", kind: "hubspot", focus: "CRM" },
    ],
  },
  {
    number: "03",
    title: "Freelance & productivity",
    description: "Support client work, reporting, and day-to-day research.",
    tools: [
      { name: "Upwork", kind: "upwork", focus: "Freelance work" },
      { name: "Fiverr", kind: "fiverr", focus: "Freelance work" },
      { name: "Excel", kind: "excel", focus: "Reporting" },
      { name: "Grok AI", kind: "grok", focus: "AI research support" },
    ],
  },
];

function ToolIcon({ kind }: { kind: ToolKind }) {
  if (kind === "apollo") return <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" strokeWidth="3" /><path d="m24 9 3.2 11.8L39 24l-11.8 3.2L24 39l-3.2-11.8L9 24l11.8-3.2L24 9Z" fill="currentColor" /></svg>;
  if (kind === "zoominfo") return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 13h22L13 34h27" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="square" strokeLinejoin="miter" /><circle cx="37" cy="14" r="3" fill="currentColor" /></svg>;
  if (kind === "crunchbase") return <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="82 28" transform="rotate(-38 24 24)" /><circle cx="35" cy="13" r="4" fill="currentColor" /></svg>;
  if (kind === "linkedin") return <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="5" width="38" height="38" rx="8" fill="currentColor" /><text x="24" y="33" fill="white" fontFamily="Arial,sans-serif" fontSize="25" fontWeight="700" textAnchor="middle">in</text></svg>;
  if (kind === "salesnav") return <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" strokeWidth="3" /><path d="m29 18-3.2 9.8L16 31l3.2-9.8L29 18Z" fill="currentColor" /><circle cx="24" cy="24" r="2" fill="white" /></svg>;
  if (kind === "instantly") return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="m24 5 4.2 13.8L42 23l-13.8 4.2L24 41l-4.2-13.8L6 23l13.8-4.2L24 5Z" fill="currentColor" /><path d="m38 33 1.8 5.2L45 40l-5.2 1.8L38 47l-1.8-5.2L31 40l5.2-1.8L38 33Z" fill="currentColor" /></svg>;
  if (kind === "hubspot") return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="m17 18 12-7m-10 19 13 7m-13-8V17m13-3v24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /><circle cx="15" cy="17" r="6" fill="currentColor" /><circle cx="33" cy="9" r="5" fill="currentColor" /><circle cx="33" cy="39" r="5" fill="currentColor" /><circle cx="16" cy="31" r="6" fill="currentColor" /><circle cx="39" cy="23" r="4" fill="currentColor" /></svg>;
  if (kind === "upwork") return <svg viewBox="0 0 48 48" aria-hidden="true"><text x="24" y="34" fill="currentColor" fontFamily="Arial,sans-serif" fontSize="28" fontWeight="700" letterSpacing="-2" textAnchor="middle">up</text></svg>;
  if (kind === "fiverr") return <svg viewBox="0 0 48 48" aria-hidden="true"><text x="24" y="34" fill="currentColor" fontFamily="Arial,sans-serif" fontSize="29" fontWeight="700" letterSpacing="-2" textAnchor="middle">fi</text><circle cx="33" cy="13" r="2.5" fill="currentColor" /></svg>;
  if (kind === "excel") return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M18 8h22v32H18z" fill="currentColor" opacity=".48" /><path d="M8 13h21v27H8z" fill="currentColor" /><path d="m13 19 11 15m0-15L13 34" stroke="white" strokeWidth="3.5" strokeLinecap="round" /></svg>;
  return <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" strokeWidth="3" /><path d="M16 33 32 15" stroke="currentColor" strokeWidth="5" strokeLinecap="round" /></svg>;
}

function ContactIcon({ kind }: { kind: "phone" | "mail" | "linkedin" }) {
  if (kind === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2ZM8.34 18H5.67V9.4h2.67ZM7 8.23a1.55 1.55 0 1 1 .02-3.1A1.55 1.55 0 0 1 7 8.23ZM18.34 18h-2.67v-4.18c0-1-.02-2.28-1.39-2.28s-1.6 1.08-1.6 2.2V18h-2.67V9.4h2.56v1.17h.04a2.8 2.8 0 0 1 2.52-1.39c2.7 0 3.2 1.78 3.2 4.09Z" />
      </svg>
    );
  }

  if (kind === "phone") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 3h3l2 5-2.2 1.6a15 15 0 0 0 6.6 6.6L16 14l5 2v3a2 2 0 0 1-2.2 2A18 18 0 0 1 3 5.2 2 2 0 0 1 5 3Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
  const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);
  window.location.href = `mailto:huzaifajutt853@gmail.com?subject=${subject}&body=${body}`;
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

      <header className={`${styles.header} ${menuOpen ? styles.headerMenuOpen : ""}`} data-site-header>
        <a className={styles.brandImage} href="#home" aria-label="Muhammad Huzaifa Ali, home" onClick={closeMenu}>
          <Image src="/images/huzaifa-wordmark.png" alt="Huzaifa" width={2059} height={239} priority />
        </a>
        <nav className={styles.desktopNav} aria-label="Main navigation">
          <a href="#about"><span>01</span>About</a>
          <a href="#experience"><span>02</span>Work</a>
          <a href="#services"><span>03</span>Services</a>
          <a href="#tools"><span>04</span>Toolkit</a>
          <a href="#contact"><span>05</span>Contact</a>
        </nav>
          <a className={styles.headerCta} href="mailto:huzaifajutt853@gmail.com" data-magnetic>Let’s talk</a>
        <button
          className={`${styles.menuButton} ${menuOpen ? styles.menuButtonOpen : ""}`}
          data-magnetic
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
              <span>0{index + 1}</span>{label}
            </a>
          ))}
        </nav>
        <div className={styles.menuFoot}><a href="mailto:huzaifajutt853@gmail.com">Get in touch</a><span>Lahore, Pakistan</span></div>
      </div>

      <main id="main-content">
        <section className={styles.hero} id="home" data-hero>
          <div className={styles.heroGrid} aria-hidden="true" />
          <div className={styles.heroRings} aria-hidden="true"><span /><span /><span /></div>
          <div className={styles.heroWatermark} data-parallax="watermark" aria-hidden="true">HUZAIFA</div>
          <div className={styles.heroPortrait} data-parallax="portrait">
            <Image src="/images/huzaifa-hero-headphones.png" alt="Muhammad Huzaifa Ali wearing headphones" fill sizes="(max-width: 680px) 84vw, 52vw" priority data-image-motion />
          </div>
          <div className={styles.heroCopy} data-reveal>
            <h1 data-hero-heading>Find the right people.<br /><span><AsciiRippleText text="Start real" /> <br className={styles.heroMobileBreak} /><span>conversations.</span></span></h1>
            <p className={styles.heroRole}>B2B lead generation &amp; business development</p>
            <p className={styles.heroText}>I help teams research their market, reach qualified prospects, and turn promising conversations into client relationships.</p>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="#services" data-magnetic>Explore how I work</a>
              <a className={styles.heroSecondary} href="mailto:huzaifajutt853@gmail.com" data-magnetic>Get in touch</a>
            </div>
          </div>
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
              <p className={styles.aboutBody}>For the past two years, I’ve worked with clients on target-market research, qualified prospect lists, LinkedIn and email outreach, tailored proposals, and sales pipeline support.</p>
              <p className={styles.aboutBody}>Alongside business development, my freelance work has included video editing. I’m currently pursuing a BS in Computer Science at Green International University.</p>
              <div className={styles.statsGrid}>
                <article className={styles.statCard} data-reveal>
                  <div className={styles.statNumber}><StatsCounter value={20} prefix="15–" startValue={15} duration={1.7} /></div>
                  <h3>Freelance clients closed</h3><p>Across his freelance services and client work.</p>
                </article>
                <article className={styles.statCard} data-reveal>
                  <div className={styles.statNumber}><StatsCounter value={50} suffix="+" duration={1.8} /></div>
                  <h3>Freelance leads</h3><p>Generated independently across freelance work.</p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.servicesSection} id="services" data-services-section>
          <div className={styles.servicesIntro} data-reveal>
            <h2>From first search<br />to <span>signed work.</span></h2>
            <p>Practical support for teams that want a clearer path from prospecting to new clients.</p>
          </div>
          <div className={styles.serviceList} data-service-list>
            {services.map((service) => (
              <article className={styles.serviceRow} key={service.number} data-service-row>
                <span className={styles.serviceNumber} data-service-number>{service.number}</span>
                <h3 data-service-copy>{service.title}</h3><p data-service-copy>{service.detail}</p><span className={styles.serviceIcon} data-service-icon aria-hidden="true">{service.icon}</span>
              </article>
            ))}
          </div>
          <aside className={styles.serviceQuote} data-service-quote>
            <span className={styles.serviceQuoteMark} aria-hidden="true">“</span>
            <div>
              <span className={styles.serviceQuoteLabel}>MY APPROACH</span>
              <blockquote>Good outreach starts with relevance. Every message should earn the next conversation.</blockquote>
              <p>— Muhammad Huzaifa Ali</p>
            </div>
            <span className={styles.serviceQuoteIndex} aria-hidden="true">01 / 04</span>
          </aside>
        </section>

        <section className={styles.workflowSection} data-workflow-section>
          <div className={styles.workflowIntro} data-reveal>
            <h2>Build a pipeline<br /><span>with purpose.</span></h2>
            <p>Research and outreach work best when every step is focused, relevant, and easy to follow up.</p>
          </div>
          <div className={styles.signalMap} data-signal-map aria-label="A three-part lead generation approach">
            <svg className={styles.signalRoutes} viewBox="0 0 1200 560" fill="none" aria-hidden="true">
              <path className={styles.signalRoute} data-signal-route d="M285 157C390 130 462 190 534 256" />
              <path className={styles.signalRoute} data-signal-route d="M920 160C820 132 742 193 665 257" />
              <path className={styles.signalRoute} data-signal-route d="M600 465C600 390 600 345 600 307" />
              <circle cx="285" cy="157" r="5" /><circle cx="920" cy="160" r="5" /><circle cx="600" cy="465" r="5" />
            </svg>
            <div className={styles.signalCore} data-signal-core>
              <span className={styles.signalCoreOrbit} />
              <span className={styles.signalCoreMark} aria-hidden="true"><i /><i /><i /></span>
              <span className={styles.signalCoreLabel}>IDEAL CUSTOMER</span>
              <strong>Right fit.<br />Right moment.</strong>
              <span className={styles.signalCoreMeta}>Market · Intent · Timing</span>
            </div>
            <article className={`${styles.signalNode} ${styles.signalResearch}`} data-signal-node>
              <span className={styles.signalNodeMeta}><i /> 01 / RESEARCH</span>
              <h3>Know who to reach</h3>
              <p>Market research, ideal customer profiles, competitor analysis, and carefully built prospect lists.</p>
              <span className={styles.signalTags}><b>ICP</b><b>Market fit</b><b>Prospects</b></span>
            </article>
            <article className={`${styles.signalNode} ${styles.signalOutreach}`} data-signal-node>
              <span className={styles.signalNodeMeta}><i /> 02 / OUTREACH</span>
              <h3>Make the first message matter</h3>
              <p>Personalized LinkedIn and email outreach with consistent qualification and follow-up.</p>
              <span className={styles.signalTags}><b>LinkedIn</b><b>Email</b><b>Follow-up</b></span>
            </article>
            <article className={`${styles.signalNode} ${styles.signalMomentum}`} data-signal-node>
              <span className={styles.signalNodeMeta}><i /> 03 / MOMENTUM</span>
              <h3>Keep good opportunities moving</h3>
              <p>Tailored proposals, clean CRM records, and clear pipeline and conversion tracking.</p>
              <span className={styles.signalTags}><b>CRM</b><b>Proposals</b><b>Next step</b></span>
            </article>
            <span className={styles.signalCoordinates} aria-hidden="true">OUTBOUND SYSTEMS / 01—03</span>
          </div>
        </section>

        <section className={styles.experienceSection} id="experience" data-experience-section>
          <div className={styles.experienceIntro} data-reveal>
            <h2>Experience built<br />through <span>real client work.</span></h2>
            <p>Freelance campaigns, client acquisition, and hands-on business development.</p>
          </div>
          <div className={styles.experienceList} data-experience-timeline>
            <span className={styles.experienceTrack} data-experience-line aria-hidden="true" />
            <article className={styles.experienceItem} data-experience-entry>
              <span className={styles.experienceMarker} data-experience-marker aria-hidden="true" />
              <div className={styles.experienceDate} data-experience-copy>2024 — PRESENT</div>
              <div><h3 data-experience-copy>Freelance Business Development Executive</h3><p className={styles.experienceCompany} data-experience-copy>Upwork &amp; LinkedIn · Remote</p>
                <ul><li data-experience-copy>Plan and run outbound lead generation campaigns for multiple clients.</li><li data-experience-copy>Research target markets and build qualified prospect lists with LinkedIn Sales Navigator.</li><li data-experience-copy>Write tailored proposals and pitches, manage sales pipelines, and track conversion activity.</li><li data-experience-copy>Optimize client LinkedIn and Upwork profiles and nurture relationships that lead to repeat work.</li></ul>
              </div>
            </article>
            <article className={styles.experienceItem} data-experience-entry>
              <span className={styles.experienceMarker} data-experience-marker aria-hidden="true" />
              <div className={styles.experienceDate} data-experience-copy>JULY — SEPTEMBER 2026</div>
              <div>
                <div className={styles.experienceHeading}>
                  <div><h3 data-experience-copy>Business Development Intern</h3><p className={styles.experienceCompany} data-experience-copy>Octacer · Digital Services</p></div>
                  <Image className={styles.companyLogo} src="/images/octacer-logo.png" alt="Octacer logo" width={447} height={447} />
                </div>
                <ul><li data-experience-copy>Generated qualified leads through targeted outreach and market analysis.</li><li data-experience-copy>Prepared proposals and presentations and supported growth opportunity research.</li><li data-experience-copy>Built early relationships with prospects and clients in digital services.</li></ul>
              </div>
            </article>
          </div>
        </section>

        <section className={styles.toolsSection} id="tools">
          <div className={styles.toolsIntro} data-reveal>
            <h2>The right tools<br />for <span>the right reach.</span></h2>
            <p>Apps I use for prospect research, outreach, client work, and reporting.</p>
          </div>
          <div className={styles.toolGroups}>
            {toolGroups.map((group) => (
              <article className={styles.toolGroup} key={group.number} data-reveal>
                <div className={styles.toolGroupHeading}>
                  <span>{group.number}</span>
                  <div><h3>{group.title}</h3><p>{group.description}</p></div>
                </div>
                <div className={styles.toolGrid}>
                  {group.tools.map((tool) => (
                    <article className={styles.toolCard} key={tool.kind} data-reveal data-magnetic>
                      <span className={styles.toolIcon} data-tool={tool.kind}><ToolIcon kind={tool.kind} /></span>
                      <span className={styles.toolCardText}><strong>{tool.name}</strong><span>{tool.focus}</span></span>
                    </article>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.educationSection} id="education">
          <div className={styles.educationBackdrop} aria-hidden="true" data-education-backdrop>
            <Image src="/images/giu-building.webp" alt="" fill sizes="100vw" data-education-parallax />
          </div>
          <div className={styles.educationCopy} data-reveal>
            <h2>Business in practice.<br /><span>Computer science in study.</span></h2>
            <div className={styles.educationDegree}><span>2023 — 2027</span><h3>BS Computer Science</h3><p>Green International University · Lahore, Pakistan</p></div>
            <p className={styles.educationNote}>A four-year, eight-semester degree program that complements my work in research, systems, and digital business.</p>
            <a className={styles.textLink} href="https://giu.edu.pk/course-detail/bs-computer-sciences" target="_blank" rel="noreferrer" data-magnetic>Explore the GIU Computer Science program</a>
          </div>
        </section>
      </main>

      <footer className={styles.footer} id="contact">
        <div className={styles.footerCta} data-footer-cta>
          <div className={styles.footerEyebrow}><span>07 /</span> LET’S MAKE SOMETHING MOVE</div>
          <div className={styles.footerHeadlineRow}>
            <h2 className={styles.footerHeadline} data-footer-heading><span data-footer-line>READY FOR</span><span data-footer-line>BETTER OUTREACH?</span></h2>
            <a className={styles.footerCircleCta} href="mailto:huzaifajutt853@gmail.com" aria-label="Start a conversation by email" data-magnetic><span aria-hidden="true">↗</span></a>
          </div>
          <p className={styles.footerLead}>Open to remote lead generation, business development roles, and new client conversations.</p>
        </div>
        <div className={styles.footerContactGrid} data-footer-contact-grid>
          <div className={styles.footerContactInfo}>
            <p className={styles.footerMicro}>START WITH HELLO</p>
            <a className={styles.footerEmail} href="mailto:huzaifajutt853@gmail.com">huzaifajutt853@gmail.com <span aria-hidden="true">↗</span></a>
            <a className={styles.footerPhone} href="tel:+923323300702">+92 332 3300702</a>
            <div className={styles.footerSocials}>
              <a className={styles.footerSocial} href="https://www.linkedin.com/in/muhammad-huzaifa-ali-075a212a2/" target="_blank" rel="noreferrer" aria-label="Muhammad Huzaifa Ali on LinkedIn"><ContactIcon kind="linkedin" /></a>
              <a className={styles.footerSocialText} href="https://www.linkedin.com/in/muhammad-huzaifa-ali-075a212a2/" target="_blank" rel="noreferrer">LinkedIn</a>
            </div>
            <div className={styles.footerNavBlock}>
              <p className={styles.footerMicro}>EXPLORE</p>
              <nav className={styles.footerNav} aria-label="Footer navigation"><a href="#services">Services</a><a href="#experience">Experience</a><a href="#education">Education</a></nav>
            </div>
          </div>
          <form className={styles.footerForm} onSubmit={handleContactSubmit}>
            <div className={styles.footerFields}>
              <label>Your name<input name="name" autoComplete="name" placeholder="Name" required /></label>
              <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
            </div>
            <label className={styles.footerMessageField}>What are you thinking?<textarea name="message" rows={3} placeholder="A role, a project, or an interesting problem…" required /></label>
            <div className={styles.footerSubmitRow}>
              <p>Good conversations start here.</p>
              <button className={styles.footerSubmit} type="submit">Send a message</button>
            </div>
          </form>
        </div>
        <div className={styles.footerWordmark} data-reveal>Huzaifa<span>®</span></div>
        <div className={styles.footerBar}><span>© {new Date().getFullYear()} MUHAMMAD HUZAIFA ALI</span><a href="#home">Back to top</a><span>LAHORE, PAKISTAN</span></div>
      </footer>
    </div>
  );
}
