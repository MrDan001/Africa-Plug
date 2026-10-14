import ContentPage from "@/components/layout/ContentPage";

const themes = [
  { label: "BUSINESS", title: "The deals shaping what comes next", copy: "Commercial thinking, market context and practical perspectives." },
  { label: "CULTURE", title: "The people behind the progress", copy: "Stories and perspectives that add context to the wider picture." },
  { label: "TRAVEL & LIFESTYLE", title: "See the continent with fresh eyes", copy: "Places, ideas and experiences worth knowing about." },
];

export default function BlogPage() {
  return (
    <ContentPage
      eyebrow="THE TAP JOURNAL"
      title="IDEAS. CONTEXT. PERSPECTIVE."
      description="A considered look at the businesses, people, places and conversations shaping the continent. The Blog will grow here as articles are edited and published."
      actionLabel="ASK THE AFRICA PLUG"
      actionHref="/contact"
    >
      <div className="standard-section-heading">
        <p className="standard-eyebrow">EDITORIAL THEMES</p>
        <h2>More than headlines.</h2>
        <p>Explore the themes the journal will cover. These are editorial areas, not published articles.</p>
      </div>
      <div className="standard-card-grid">
        {themes.map((theme, index) => (
          <article className="standard-card" key={theme.label}>
            <span className="standard-card-number">0{index + 1}</span>
            <p className="standard-card-category">{theme.label}</p>
            <h3>{theme.title}</h3>
            <p>{theme.copy}</p>
            <span className="standard-coming-label">ARTICLES COMING SOON</span>
          </article>
        ))}
      </div>
      <div className="standard-social-row">
        <span>FOLLOW THE CONVERSATION</span>
        <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
        <a href="https://www.youtube.com/" target="_blank" rel="noreferrer">YouTube ↗</a>
        <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram ↗</a>
      </div>
    </ContentPage>
  );
}
