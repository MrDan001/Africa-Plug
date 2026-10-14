import styles from "./BookstoreFeature.module.css";

export default function BookstoreFeature() {
  return (
    <section className={styles.feature} aria-labelledby="playbook-title">
      <div className={styles.cityStrip} role="img" aria-label="City skyline at dusk" />
      <div className={styles.copy}>
        <p className={styles.eyebrow}>THE AFRICA PLAYBOOK</p>
        <h2 id="playbook-title">The knowledge you wish somebody gave you before you arrived.</h2>
        <p className={styles.description}>Practical guides, field notes and useful context for making better decisions across African markets and cities.</p>
        <a className={styles.cta} href="/store">Explore the Playbooks <span aria-hidden="true">⟶</span></a>
      </div>
    </section>
  );
}
