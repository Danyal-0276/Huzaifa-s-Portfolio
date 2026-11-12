import styles from "./ascii-ripple-text.module.css";

export default function AsciiRippleText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-ascii-ripple
      tabIndex={0}
    >
      <span className={styles.srOnly}>{text}</span>
      <span aria-hidden="true">
        {[...text].map((character, index) => (
          <span className={styles.glyph} data-glyph={character} key={`${character}-${index}`}>
            {character === " " ? "\u00a0" : character}
          </span>
        ))}
      </span>
    </span>
  );
}
