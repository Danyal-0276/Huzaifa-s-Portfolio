"use client";

import { useRef, useState, type FormEvent } from "react";
import StatsCounter from "@/components/ui/stats-counter";
import { usePortfolioMotion } from "@/hooks/use-portfolio-motion";
import styles from "./portfolio-page.module.css";

type Project = {
  name: string;
  category: string;
  type: "novu" | "pulse" | "luma" | "nori";
  description: string;
};

const projects: Project[] = [
  {
    name: "NOVU",
    category: "Research",
    type: "novu",
    description: "A calmer way to organize everyday finances.",
  },
  {
    name: "PULSE",
    category: "Product design",
    type: "pulse",
    description: "A clear view of the metrics that move teams forward.",
  },
  {
    name: "LUMA",
    category: "Brand + digital",
    type: "luma",
    description: "A warmer digital home for modern skincare.",
  },
  {
    name: "NORI",
    category: "Prototyping",
    type: "nori",
    description: "A simple mobile experience for making good food.",
  },
];

const services = [
  {
    number: "01",
    title: "UI design",
    detail: "Useful, considered interfaces that make complex things feel simple.",
    icon: "↗",
  },
  {
    number: "02",
    title: "UX research",
    detail: "The right questions, thoughtful testing, and clear product direction.",
    icon: "⌕",
  },
  {
    number: "03",
    title: "Branding",
    detail: "Distinct visual systems that help good ideas stand apart.",
    icon: "✳",
  },
  {
    number: "04",
    title: "Prototyping",
    detail: "High-fidelity prototypes that make the next decision easier.",
    icon: "◇",
  },
];

const process = [
  ["01", "Discover", "Listen closely, study the landscape, and find the real problem."],
  ["02", "Define", "Turn what we learn into a focused plan and shared direction."],
  ["03", "Design", "Explore, prototype, and refine the experience together."],
  ["04", "Deliver", "Polish the details and prepare a thoughtful handoff."],
];

function PortraitIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 620 760"
      role="img"
      aria-label="Editorial illustration of Michael, a designer with curly hair and glasses"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="jacket" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#28292b" />
          <stop offset="1" stopColor="#101112" />
        </linearGradient>
        <linearGradient id="skin" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f6c6a1" />
          <stop offset="1" stopColor="#cf8765" />
        </linearGradient>
        <linearGradient id="shirt" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e8e5dc" />
          <stop offset="1" stopColor="#b5b0a8" />
        </linearGradient>
      </defs>
      <path d="M70 760c16-112 77-178 180-202l60-17 73 3 72 19c91 27 138 91 151 197H70Z" fill="url(#jacket)" />
      <path d="m246 542 65 88 70-89 45 17-35 202H245l-37-194z" fill="url(#shirt)" />
      <path d="m265 476 1 101 45 51 69-59-6-105z" fill="url(#skin)" />
      <path d="m220 615 92 62 77-62 17 145H213z" fill="#e04e24" />
      <path d="m311 679-21 81h46l-20-81" fill="#18191a" />
      <path d="M205 286c-28 1-42 24-37 57 5 34 25 54 48 48m205-105c27-1 39 21 34 54-4 30-22 51-43 47" fill="url(#skin)" />
      <path d="M189 236c2-91 52-151 128-151 86 0 136 63 133 156l-13 111c-7 76-59 139-127 139s-119-57-128-134z" fill="url(#skin)" />
      <path d="M169 264c-18-63-8-124 26-163 5-32 27-48 51-46 18-37 57-46 87-29 31-22 73-10 87 18 37 3 60 37 49 70 30 45 18 98 2 144l-17 35-18-104c-22-9-42-24-58-48-27 25-69 38-109 39-30 2-61-3-89-14l6 128-17-30Z" fill="#161719" />
      <g fill="#161719">
        <circle cx="198" cy="146" r="35" /><circle cx="224" cy="106" r="36" /><circle cx="260" cy="82" r="35" />
        <circle cx="302" cy="68" r="38" /><circle cx="346" cy="73" r="39" /><circle cx="390" cy="93" r="37" />
        <circle cx="426" cy="126" r="34" /><circle cx="448" cy="164" r="29" /><circle cx="177" cy="190" r="28" />
      </g>
      <path d="M254 318c11-7 26-7 37 0m54 0c12-7 27-7 38 0" fill="none" stroke="#573d34" strokeLinecap="round" strokeWidth="6" />
      <path d="M309 322c-5 24-13 44-11 52 4 6 12 8 21 4" fill="none" stroke="#a86752" strokeLinecap="round" strokeWidth="5" />
      <path d="M284 400c19 13 43 14 64-1" fill="none" stroke="#874b42" strokeLinecap="round" strokeWidth="6" />
      <g fill="#f7f7f5" fillOpacity=".17" stroke="#171819" strokeWidth="9">
        <rect x="220" y="285" width="88" height="64" rx="18" />
        <rect x="344" y="285" width="88" height="64" rx="18" />
      </g>
      <path d="M308 309c12-10 24-10 36 0" fill="none" stroke="#171819" strokeWidth="8" />
      <path d="M223 307h-22m233 0h21" stroke="#171819" strokeLinecap="round" strokeWidth="8" />
      <circle cx="272" cy="316" r="5" fill="#27211e" /><circle cx="396" cy="316" r="5" fill="#27211e" />
      <path d="M165 757h371" stroke="#e04e24" strokeWidth="7" />
    </svg>
  );
}

function ProjectArtwork({ project }: { project: Project }) {
  return (
    <div
      className={`${styles.artwork} ${styles[`artwork${project.type}`]}`}
      role="img"
      aria-label={`${project.name} project artwork`}
    >
      <div className={styles.artChrome}><i /><i /><i /><span>{project.name.toLowerCase()}.studio</span><b>↗</b></div>
      {project.type === "novu" && (
        <div className={styles.novuScene}>
          <div className={styles.novuPhone}><span>good afternoon,</span><strong>Alexandra</strong><div className={styles.novuBalance}><small>AVAILABLE BALANCE</small><b>$12,480<span>.00</span></b><i>↗ 8.4% this month</i></div><div className={styles.novuRows}><i /><i /><i /></div></div>
          <div className={styles.novuOrb} />
          <span className={styles.artWord}>money, made<br />more human.</span>
        </div>
      )}
      {project.type === "pulse" && (
        <div className={styles.pulseScene}>
          <aside><b>P.</b><i /><i /><i /><i /></aside>
          <div className={styles.pulseBoard}><div className={styles.pulseBoardHead}><b>Weekly overview</b><span>Last 7 days⌄</span></div><div className={styles.pulseMetric}><span>Active users</span><strong>24,892</strong><i>↗ 12.8%</i></div><div className={styles.pulseChart}><svg viewBox="0 0 420 130" preserveAspectRatio="none"><path d="M0 95 C45 90 45 61 95 72 S150 87 188 46 239 67 275 33 339 60 365 20 399 35 420 12" fill="none" stroke="#5e69e7" strokeWidth="4"/><path d="M0 95 C45 90 45 61 95 72 S150 87 188 46 239 67 275 33 339 60 365 20 399 35 420 12V130H0Z" fill="url(#pulseFill)" opacity=".2"/></svg></div><div className={styles.pulseTiles}><i /><i /><i /></div></div>
        </div>
      )}
      {project.type === "luma" && (
        <div className={styles.lumaScene}><div className={styles.lumaSun} /><span className={styles.lumaLogo}>luma</span><span className={styles.lumaSmall}>SKINCARE, IN A SOFTER LIGHT</span><div className={styles.lumaBottle}><i /><b>LUMA<br /><small>DAILY GLOW</small></b></div><div className={styles.lumaJar}><b>LUMA</b></div></div>
      )}
      {project.type === "nori" && (
        <div className={styles.noriScene}><span className={styles.noriWord}>nori<span>®</span></span><span className={styles.noriSub}>GOOD FOOD, NO FUSS.</span><div className={styles.noriPlate}><i className={styles.noodle1} /><i className={styles.noodle2} /><i className={styles.noodle3} /><b>✳</b></div><div className={styles.noriSticker}>FRESH<br />IDEAS<br />DAILY</div></div>
      )}
    </div>
  );
}

export default function PortfolioPage() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "project">("project");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  usePortfolioMotion(rootRef);

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNewsletterMessage("Thanks — the mailing list connection will be added before launch.");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={styles.site} ref={rootRef}>
      <a className={styles.skipLink} href="#main-content">Skip to content</a>
      <header className={styles.header}>
        <a className={styles.brand} href="#home" aria-label="Michael, home" onClick={closeMenu}>M<span>.</span></a>
        <nav className={styles.desktopNav} aria-label="Main navigation">
          <a href="#home">Home</a><a href="#about">About</a><a href="#services">Service</a><a href="#contact">Contact</a>
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
        <p className={styles.menuEyebrow}>TAKE A LOOK AROUND</p>
        <nav aria-label="Full screen navigation">
          {["Home", "About", "Services", "Projects", "Contact"].map((item, index) => (
            <a href={`#${["home", "about", "services", "projects", "contact"][index]}`} key={item} onClick={closeMenu}>
              <span>0{index + 1}</span>{item}<b>↗</b>
            </a>
          ))}
        </nav>
        <div className={styles.menuFoot}><span>INDEPENDENT DESIGNER</span><a href="mailto:hello@michael.design">LET'S TALK ↗</a></div>
      </div>

      <main id="main-content">
        <section className={styles.hero} id="home" data-hero>
          <div className={styles.heroGrid} aria-hidden="true" />
          <div className={styles.heroWatermark} data-parallax="watermark" aria-hidden="true">MICHAEL</div>
          <div className={styles.heroMeta}><span>INDEPENDENT UI/UX DESIGNER</span><span>AVAILABLE FOR SELECT PROJECTS <i /></span></div>
          <div className={styles.heroSideNote}>DIGITAL DESIGN<br />MADE SIMPLE</div>
          <div className={styles.heroPortrait} data-parallax="portrait">
            <PortraitIllustration className={styles.portraitSvg} />
            <div className={styles.portraitIndex}><span>FIG. 01</span><span>DESIGNER / MAKER</span></div>
          </div>
          <div className={styles.heroCopy} data-reveal>
            <p className={styles.heroKicker}><span>THOUGHTFUL BY DESIGN</span><i>✳</i></p>
            <h1>Make digital<br /><span>feel human.</span></h1>
            <p className={styles.heroText}>Good design does more than look right. It makes the next step feel obvious.</p>
            <a className={styles.primaryButton} href="#projects">Explore selected work <span>↗</span></a>
          </div>
          <a className={styles.heroProject} href="#projects" data-float aria-label="See the Novu project">
            <ProjectArtwork project={projects[0]} />
            <div className={styles.projectFooter}><strong><i /> NOVU</strong><span>/Research</span></div>
          </a>
          <div className={styles.heroBottom}><span>SCROLL TO EXPLORE <b>↓</b></span><span>BASED IN NEW YORK · WORKING EVERYWHERE</span></div>
        </section>

        <section className={styles.aboutSection} id="about">
          <div className={styles.sectionTop}><span>01 / A LITTLE ABOUT ME</span><span>GOOD THINGS START WITH LISTENING</span></div>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutPortraitWrap} data-reveal>
              <div className={styles.cornerFrame}><span /><span /><span /><span /></div>
              <div className={styles.aboutPortrait}><PortraitIllustration className={styles.aboutPortraitSvg} /></div>
              <div className={styles.aboutPortraitLabel}><span>MICHAEL — DESIGNER</span><span>EST. 2018</span></div>
            </div>
            <div className={styles.aboutCopy}>
              <div className={styles.pill}><i /> A HUMAN-FIRST DESIGN PRACTICE</div>
              <div className={styles.aboutHeadingRow} data-reveal>
                <h2>Crafting digital<br />experiences through<br /><span>user experience.</span></h2>
                <span className={styles.aboutAsterisk} data-spin aria-hidden="true">✳</span>
              </div>
              <p className={styles.aboutIntro}>HI, I'M MICHAEL, A UI/UX DESIGNER PASSIONATE ABOUT CREATING INTUITIVE AND VISUALLY ENGAGING DIGITAL EXPERIENCES.</p>
              <p className={styles.aboutBody}>I partner with ambitious people to turn knotty problems into calm, clear products. I care about the tiny details, the big picture, and how it all feels to use.</p>
              <div className={styles.statsGrid}>
                <article className={styles.statCard} data-reveal>
                  <div className={styles.statNumber}><StatsCounter value={37} suffix="+" duration={2} /></div>
                  <h3>Projects completed</h3><p>From early sketches to shipped experiences.</p>
                </article>
                <article className={styles.statCard} data-reveal>
                  <div className={styles.statNumber}><StatsCounter value={72} suffix="+" duration={2.2} /></div>
                  <h3>Happy clients</h3><p>Good relationships make better work.</p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.servicesSection} id="services">
          <div className={styles.sectionTop}><span>02 / WHAT I DO</span><span>FROM FIRST THOUGHT TO FINAL PIXEL</span></div>
          <div className={styles.servicesIntro} data-reveal>
            <div><div className={styles.pill}><i /> OUR SERVICES</div><h2>Powerful design solutions<br />for <span>modern brands.</span></h2></div>
            <p>Build trust, find clarity, and create digital experiences people want to come back to.</p>
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

        <section className={styles.projectsSection} id="projects">
          <div className={styles.sectionTop}><span>03 / SELECTED WORK</span><span>A FEW RECENT COLLABORATIONS</span></div>
          <div className={styles.projectsIntro} data-reveal>
            <div><div className={styles.pill}><i /> THE WORK SPEAKS</div><h2>Thoughtful ideas,<br /><span>beautifully useful.</span></h2></div>
            <p>A small selection of product and brand work, made better with good people.</p>
          </div>
          <div className={styles.projectGrid}>
            {projects.map((project, index) => (
              <a className={`${styles.projectCard} ${index % 2 === 1 ? styles.projectOffset : ""}`} href="mailto:hello@michael.design?subject=Tell%20me%20about%20your%20work" key={project.name} data-reveal>
                <ProjectArtwork project={project} />
                <div className={styles.projectFooter}><strong><i /> {project.name}</strong><span>/{project.category}</span></div>
                <p className={styles.projectDescription}>{project.description}</p>
              </a>
            ))}
          </div>
          <a className={styles.allProjectsButton} href="mailto:hello@michael.design?subject=Portfolio%20projects">ALL PROJECTS <span>↗</span></a>
        </section>

        <section className={styles.processSection}>
          <div className={styles.pill}><i /> MY DESIGN PROCESS</div>
          <h2 data-reveal>DESIGN <span>PROCESS</span></h2>
          <p className={styles.processLead}>Clear steps. Open collaboration. Better outcomes.</p>
          <div className={styles.processGrid}>
            {process.map(([number, title, detail]) => (
              <article className={styles.processCard} key={number} data-reveal>
                <span className={styles.processNumber}>{number}</span><span className={styles.processSpark} aria-hidden="true">✳</span><h3>{title}</h3><p>{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.pricingSection} id="pricing">
          <div className={styles.sectionTop}><span>04 / INVESTMENT</span><span>GOOD WORK, FAIRLY PRICED</span></div>
          <div className={styles.pricingIntro} data-reveal>
            <div><div className={styles.pill}><i /> SIMPLE, BY DESIGN</div><h2>Simple plans<br />for <span>every need.</span></h2></div>
            <div className={styles.priceToggle} role="group" aria-label="Choose a pricing model">
              <button type="button" className={billing === "monthly" ? styles.toggleActive : ""} onClick={() => setBilling("monthly")}>Monthly</button>
              <button type="button" className={billing === "project" ? styles.toggleActive : ""} onClick={() => setBilling("project")}>Project based</button>
              <span className={`${styles.toggleThumb} ${billing === "project" ? styles.toggleThumbRight : ""}`} aria-hidden="true" />
            </div>
          </div>
          <div className={styles.pricingGrid}>
            <article className={styles.packageCard} data-reveal>
              <div className={styles.packageTag}>COMPLETE PACKAGE</div>
              <div className={styles.packageTop}><span>THE ESSENTIALS</span><span>01 / 02</span></div>
              <h3>Basic Design<br />Package</h3>
              <p className={styles.packageIntro}>A focused foundation for your next digital idea.</p>
              <div className={styles.packageFacts}><span><small>DELIVERY</small><b>2–3 weeks</b></span><span><small>REVISIONS</small><b>Up to 2</b></span></div>
              <a className={styles.packageLink} href="mailto:hello@michael.design?subject=Basic%20Design%20Package">Let's talk about it <b>↗</b></a>
            </article>
            <article className={`${styles.packageCard} ${styles.featuredPackage}`} data-reveal>
              <div className={styles.featuredPackageTop}><span>ONE-TIME PAYMENT</span><span className={styles.featuredBadge}>POPULAR</span></div>
              <div className={styles.priceLine}><strong>{billing === "project" ? "$200" : "$650"}</strong><span>/{billing === "project" ? "Project" : "Month"}</span></div>
              <p className={styles.priceCaption}>{billing === "project" ? "A clear scope, one thoughtful delivery." : "Ongoing design support, month to month."}</p>
              <ul className={styles.featureList}>
                {["Homepage + up to 2 inner pages", "Starter design system", "Basic website setup", "Initial analysis", "Basic SEO setup", "1 month support"].map((feature) => <li key={feature}><span>↗</span>{feature}</li>)}
              </ul>
              <p className={styles.guarantee}>✳ If it doesn’t feel right, we’ll make it right.</p>
              <a className={styles.packageCta} href="mailto:hello@michael.design?subject=Start%20a%20design%20project">Start a project <span>↗</span></a>
            </article>
          </div>
        </section>
      </main>

      <footer className={styles.footer} id="contact">
        <div className={styles.footerTop}>
          <div className={styles.footerBio}><div className={styles.pill}><i /> HAVE A GOOD ONE IN MIND?</div><h2>Let’s make<br /><span>something matter.</span></h2><p>Focused on crafting clean and intuitive experiences that blend creativity, usability, and functionality to help brands connect better with their users.</p><a className={styles.footerEmail} href="mailto:hello@michael.design">hello@michael.design <span>↗</span></a></div>
          <div className={styles.footerSide}>
            <div className={styles.newsletterCard}><span>THE OCCASIONAL GOOD THING</span><h3>Notes on making<br />digital feel better.</h3><form onSubmit={handleNewsletterSubmit}><label className={styles.srOnly} htmlFor="newsletter-email">Your email address</label><input id="newsletter-email" type="email" placeholder="Your email address" required /><button type="submit">Your message <span>↗</span></button></form><p aria-live="polite">{newsletterMessage || "No noise, just useful ideas. Unsubscribe whenever."}</p></div>
            <div className={styles.footerLinks}><div><span>NAVIGATE</span><a href="#about">About</a><a href="#services">Services</a><a href="#projects">Projects</a><a href="#pricing">Pricing</a></div><div><span>ELSEWHERE</span><a href="https://dribbble.com/" target="_blank" rel="noreferrer">Dribbble ↗</a><a href="https://behance.net/" target="_blank" rel="noreferrer">Behance ↗</a><a href="https://linkedin.com/" target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="https://instagram.com/" target="_blank" rel="noreferrer">Instagram ↗</a></div></div>
            <a className={styles.footerPhone} href="tel:+15550142048">+1 (555) 014-2048 <span>↗</span></a>
          </div>
        </div>
        <div className={styles.footerWordmark}>Michael<span>®</span></div>
        <div className={styles.footerBar}><span>© {new Date().getFullYear()} MICHAEL — INDEPENDENT DESIGNER</span><a href="#home">BACK TO TOP ↑</a><span>MADE WITH INTENTION.</span></div>
      </footer>
    </div>
  );
}
