"use client";

import { useState } from "react";
import { contactCopy, emailParts, emitCta } from "@/content/contact";
import { toggleMode } from "@/lib/walk/mode";
import { useReducedMotion } from "@/lib/a11y/reducedMotion";

export function TakeTheWalk() {
  const reduced = useReducedMotion();
  return (
    <button type="button" className="static-btn static-btn-primary" onClick={() => toggleMode()}>
      {reduced ? "Take the walk anyway" : "Take the walk"}
    </button>
  );
}

export function EmailActions() {
  const [copied, setCopied] = useState(false);
  const [addr, setAddr] = useState("");
  const { user, host } = emailParts();

  const copy = async () => {
    emitCta("copy");
    try {
      await navigator.clipboard.writeText(`${user}@${host}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setAddr(`${user}@${host}`); // no clipboard access: show it so it can be copied by hand
    }
  };

  return (
    <>
      <button
        type="button"
        className="static-btn static-btn-primary"
        onClick={() => {
          emitCta("email");
          window.location.href = `mailto:${user}@${host}`;
        }}
      >
        {contactCopy.say}
      </button>
      <button type="button" className="static-btn static-btn-secondary" onClick={copy}>
        {copied ? contactCopy.copied : contactCopy.copy}
      </button>
      <span role="status" className={addr ? "static-addr" : "sr-only"}>
        {addr || (copied ? "Email address copied" : "")}
      </span>
    </>
  );
}

export function CtaLink({ type, href, children }: { type: "resume" | "github" | "linkedin"; href: string; children: React.ReactNode }) {
  const external = /^https?:\/\//.test(href);
  return (
    <a
      className="static-btn static-btn-secondary"
      href={href}
      onClick={() => emitCta(type)}
      {...(type === "resume" ? { download: true } : {})}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
