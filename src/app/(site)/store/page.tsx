import ContentPage from "@/components/layout/ContentPage";

export default function StorePage() {
  return (
    <ContentPage
      eyebrow="THE TAP STORE"
      title="TOOLS FOR YOUR NEXT STEP."
      description="Practical resources designed to help you understand the landscape, think clearly about opportunities and take informed next steps."
      actionLabel="ASK ABOUT THE STARTER GUIDE"
      actionHref="mailto:connect@theafricaplug.com?subject=Africa%20Starter%20Guide"
    >
      <div className="store-feature">
        <div className="store-feature-art" aria-hidden="true">
          <div className="store-guide-cover">
            <span>THE AFRICA</span>
            <strong>STARTER<br />GUIDE</strong>
            <div className="store-africa-shape" />
            <small>A PRACTICAL STARTING POINT</small>
          </div>
        </div>
        <div className="store-feature-copy">
          <p className="standard-eyebrow">COMING SOON · FEATURED RESOURCE</p>
          <h2>The Africa Starter Guide</h2>
          <p>A practical guide for people who want to better understand Africa’s commercial landscape and approach opportunities with stronger context.</p>
          <p className="store-status"><span /> Preparing for release</p>
          <a className="standard-text-link" href="mailto:connect@theafricaplug.com?subject=Notify%20me%20about%20the%20Africa%20Starter%20Guide">Ask for release updates <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div className="standard-section-heading">
        <p className="standard-eyebrow">MADE TO BE USEFUL</p>
        <h2>Resources with a purpose.</h2>
        <p>Products and digital resources will be listed here with clear descriptions, pricing and delivery details before checkout is enabled.</p>
      </div>
    </ContentPage>
  );
}
