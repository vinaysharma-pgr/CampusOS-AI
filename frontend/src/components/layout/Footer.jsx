// src/components/layout/Footer.jsx
import { Link } from "react-router-dom";
import { ScanEye } from "lucide-react";
import { GithubIcon, TwitterIcon, LinkedinIcon } from "../common/BrandIcons";
import NewsletterForm from "../ui/NewsletterForm";

const COLUMNS = [
  { title: "Platform", links: ["Modules", "Facilities", "Events", "Heatmap", "AI"] },
  { title: "Project", links: ["About", "Team", "Docs", "Changelog", "Contact"] },
  { title: "Resources", links: ["Guides", "Status", "Security", "Privacy", "Terms"] },
  { title: "Campus", links: ["SRMS CET", "SRMS IMS", "SRMS Hospital", "SRMS Law", "SRMS Nursing"] },
];

const CONTAINER_STYLE = {
  width: "100%",
  maxWidth: "1200px",
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
};

export default function Footer() {
  return (
    <footer
      className="relative bg-background"
      style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div style={{ ...CONTAINER_STYLE, paddingTop: "5rem", paddingBottom: "5rem" }}>
        <div className="grid grid-cols-2 gap-12 md:grid-cols-[1.8fr_1fr_1fr_1fr_1fr] lg:gap-16">
          <div className="col-span-2 flex flex-col gap-7 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <span
                className="flex items-center justify-center rounded-lg"
                style={{
                  height: "32px",
                  width: "32px",
                  backgroundColor: "rgba(63,224,197,0.1)",
                  color: "var(--color-primary)",
                  border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)",
                }}
              >
                <ScanEye size={16} strokeWidth={1.75} />
              </span>
              <span className="text-[14.5px] font-semibold tracking-tight text-text-primary">
                CampusOS<span style={{ color: "var(--color-primary)" }}>.ai</span>
              </span>
            </Link>
            <p
              className="text-text-secondary"
              style={{ maxWidth: "20rem", fontSize: "13px", lineHeight: 1.6 }}
            >
              A student project built for SRMS CET Bareilly. The intelligent operating system for the modern campus.
            </p>
            <div style={{ marginTop: "4px" }}>
              <NewsletterForm />
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-3.5">
              <h4
                className="font-mono text-text-tertiary"
                style={{
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                }}
              >
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-text-secondary transition-colors hover:text-text-primary"
                      style={{ fontSize: "13px" }}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col items-center justify-between gap-5 pt-8 lg:flex-row"
          style={{ marginTop: "4rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p
            className="font-mono text-text-tertiary"
            style={{
              fontSize: "10.5px",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
            }}
          >
            © {new Date().getFullYear()} CampusOS.ai — SRMS CET Bareilly
          </p>
          <div className="flex items-center gap-2">
            {[GithubIcon, TwitterIcon, LinkedinIcon].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="flex items-center justify-center rounded-lg text-text-tertiary transition-all hover:border-primary/40 hover:text-primary"
                style={{
                  height: "32px",
                  width: "32px",
                  border: "1px solid rgba(255,255,255,0.13)",
                  backgroundColor: "#0e1014",
                }}
              >
                <Icon size={13} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}