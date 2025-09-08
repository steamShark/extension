/// <reference types="chrome" />
import { useMemo } from "react";
import "./styles/footer.css";

const hasChrome =
  typeof globalThis !== "undefined" && "chrome" in globalThis;

export default function Footer() {
  const version = useMemo(() => {
    try {
      if (hasChrome) return "v" + chrome.runtime.getManifest().version;
    } catch {}
    return "v1.0.0";
  }, []);

  return (
    <footer className="border-t border-separator bg-card">
      <div className="container footer-inner">
        <p>© 2025 steamShark Extension. All rights reserved.</p>
        <div className="footer-links">
          <span>{version}</span>
          <span className="dot">•</span>
          <a href="#" className="footer-link">Privacy</a>
          <span className="dot">•</span>
          <a href="#" className="footer-link">Terms</a>
        </div>
      </div>
    </footer>
  );
}
