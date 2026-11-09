import type { Metadata } from "next";
import ContentPage from "@/components/layout/ContentPage";
import { PartnershipTrigger } from "@/components/forms/PartnershipDialog";

export const metadata: Metadata = {
  title: { absolute: "About The Africa Plug | Your Connection to Africa | The Africa Plug" },
  description: "The Africa Plug brings Africa and the world together through investment, business and entertainment. Founded by FK, Africa Commercial Deal Consultant.",
};

const territories = [
  { title: "INVESTMENT", copy: "Where the opportunity is, and what it takes to reach it." },
  { title: "BUSINESS", copy: "Market entry, partners and deals across the continent." },
  { title: "ENTERTAINMENT", copy: "The culture, travel and people that make Africa move." },
];

export default function AboutPage() {
  return <ContentPage eyebrow="ABOUT THE AFRICA PLUG" title="THE CONNECTION BETWEEN AFRICA AND THE WORLD." description="The Africa Plug brings Africa and the world together through investment, business and entertainment.">
    <section className="about-gap">
      <p className="standard-eyebrow">THE GAP WE CLOSE</p>
      <p>Most of the world sees Africa from a distance. The people doing business here know a different continent: more complex, better connected and fuller of possibility than the coverage suggests. The Africa Plug exists to close that gap, and to make sure the right people meet.</p>
    </section>
    <section className="about-territories" aria-label="The Africa Plug's focus areas">
      {territories.map((territory) => <article key={territory.title}><h2>{territory.title}</h2><p>{territory.copy}</p></article>)}
    </section>
    <section className="about-founder" id="founder">
      <img className="about-founder-photo" src="/images/fk.jpg" alt="FK, founder of The Africa Plug" />
      <div><p className="standard-eyebrow">MEET THE FOUNDER</p><h2>FK</h2><p>FK is the founder of The Africa Plug. She moved to Nigeria a decade ago, when few people understood why. Today, Africa is making that case on its own.</p><p>What she has built is a platform for the people, opportunities and stories shaping the continent, with a perspective that extends beyond any one country, industry or individual.</p></div>
    </section>
  </ContentPage>;
}

