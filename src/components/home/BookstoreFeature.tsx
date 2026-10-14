export default function BookstoreFeature() {
  return (
    <section className="africa-playbook-feature" aria-labelledby="playbook-title">
      <div className="africa-playbook-copy">
        <p className="africa-playbook-eyebrow">THE AFRICA PLAYBOOK</p>
        <h2 id="playbook-title">The knowledge you wish somebody gave you before you arrived.</h2>
        <p className="africa-playbook-description">Practical guides, field notes and useful context for making better decisions across African markets and cities.</p>
        <a className="africa-playbook-cta" href="/store">EXPLORE THE BOOKSHELF <span aria-hidden="true">→</span></a>
        <p className="africa-playbook-footnote">10 practical demo titles to browse. Choose a book to read more.</p>
      </div>
      <div className="africa-playbook-visual" role="img" aria-label="Africa Plug book covers resting on a bookshelf">
        <div className="africa-playbook-glow" />
        <div className="africa-playbook-book africa-playbook-book--left">
          <span>THE AFRICA PLUG / BOOKS</span><b>DOING BUSINESS<br />IN NIGERIA</b><i>MARKET PLAYBOOK</i>
        </div>
        <div className="africa-playbook-book africa-playbook-book--main">
          <span>THE AFRICA PLUG / BOOKS</span><b>THE AFRICA<br />STARTER GUIDE</b><div className="africa-playbook-map" aria-hidden="true">✦</div><i>YOUR NEXT MOVE STARTS WITH CONTEXT</i>
        </div>
        <div className="africa-playbook-book africa-playbook-book--right">
          <span>THE AFRICA PLUG / BOOKS</span><b>THE OPPORTUNITY<br />MAPPING WORKBOOK</b><i>THINK. CHECK. DECIDE.</i>
        </div>
        <div className="africa-playbook-plank" />
      </div>
    </section>
  );
}
