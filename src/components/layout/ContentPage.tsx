import type { ReactNode } from "react";

type ContentPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  children: ReactNode;
};

export default function ContentPage({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  children,
}: ContentPageProps) {
  return (
    <div className="standard-page">
      <section className="standard-page-hero">
        <p className="standard-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="standard-page-lede">{description}</p>
        {actionLabel && actionHref ? (
          <a className="standard-button" href={actionHref}>
            {actionLabel}<span aria-hidden="true">↗</span>
          </a>
        ) : null}
      </section>
      <div className="standard-page-content">{children}</div>
    </div>
  );
}
