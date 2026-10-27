import { describe, it } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../src/lib/i18n/LanguageProvider.tsx";
import LanguageSwitcher from "../src/components/LanguageSwitcher.tsx";
import SiteHeader from "../src/components/SiteHeader.tsx";
import HelpHub from "../src/components/help/HelpHub.tsx";
import EvidencePdfBuilder from "../src/components/help/EvidencePdfBuilder.tsx";
import { UrlResultCard } from "../src/components/phase2/UrlResultCard.tsx";
import { getDemoUrlReport } from "../src/lib/url/demo.ts";
import { getTabTargetIndex } from "../src/lib/a11y/tab-navigation.ts";
import {
  getIntroSkipReason,
  hasSeenIntro,
  INTRO_SESSION_KEY,
} from "../src/lib/intro.ts";
import { localizeSeverity } from "../src/lib/i18n/url.ts";

function renderWithLanguage(
  element: React.ReactElement,
  language: "en" | "hi"
): string {
  return renderToStaticMarkup(
    React.createElement(LanguageProvider, {
      initialLanguage: language,
      children: element,
    })
  );
}

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

describe("Phase 4 accessible tab and keyboard behavior", () => {
  it("implements a roving tab stop and a matching panel for every tab", () => {
    const html = renderWithLanguage(React.createElement(HelpHub), "en");
    assert.match(html, /role="tablist"/);
    assert.match(html, /aria-label="Emergency and safety help tools"/);

    for (const id of ["emergency", "playbooks", "phone", "evidence"]) {
      assert.match(html, new RegExp(`id="help-tab-${id}"`));
      assert.match(html, new RegExp(`aria-controls="help-panel-${id}"`));
      assert.match(html, new RegExp(`id="help-panel-${id}"`));
      assert.match(html, new RegExp(`aria-labelledby="help-tab-${id}"`));
    }

    assert.match(html, /role="tab"[^>]*aria-selected="true"[^>]*tabindex="0"/);
    assert.match(html, /role="tab"[^>]*aria-selected="false"[^>]*tabindex="-1"/);
    assert.match(html, /role="tabpanel"[^>]*tabindex="0"/);
    assert.match(html, /role="tabpanel"[^>]*tabindex="-1"[^>]*hidden=""/);
  });

  it("wraps arrow keys and supports Home/End without handling unrelated keys", () => {
    assert.equal(getTabTargetIndex(0, "ArrowRight", 4), 1);
    assert.equal(getTabTargetIndex(3, "ArrowRight", 4), 0);
    assert.equal(getTabTargetIndex(0, "ArrowLeft", 4), 3);
    assert.equal(getTabTargetIndex(2, "ArrowLeft", 4), 1);
    assert.equal(getTabTargetIndex(2, "Home", 4), 0);
    assert.equal(getTabTargetIndex(1, "End", 4), 3);
    assert.equal(getTabTargetIndex(1, "Enter", 4), null);
    assert.equal(getTabTargetIndex(1, "Tab", 4), null);
    assert.equal(getTabTargetIndex(0, "ArrowRight", 0), null);
    assert.equal(getTabTargetIndex(-1, "ArrowRight", 4), null);
  });
});

describe("Phase 4 accessible controls and responsive navigation", () => {
  it("exposes desktop and mobile navigation with state and emergency links", () => {
    const html = renderWithLanguage(React.createElement(SiteHeader), "en");
    assert.match(html, /aria-label="Primary navigation"/);
    assert.match(html, /class="hidden items-center[^"]*xl:flex\b/);
    assert.match(html, /aria-expanded="false"/);
    assert.match(html, /aria-controls="mobile-navigation"/);
    assert.match(html, /aria-label="Open navigation menu"/);
    assert.match(html, /id="mobile-navigation"[^>]*hidden=""/);
    assert.match(html, /id="mobile-navigation"[^>]*xl:hidden/);
    assert.match(html, /href="tel:112"/);
    assert.match(html, /href="tel:1930"/);
    assert.match(html, /href="https:\/\/cybercrime\.gov\.in"/);
    assert.match(html, /In immediate danger\?/);
  });

  it("uses pressed language buttons and a polite live announcement", () => {
    const html = renderWithLanguage(React.createElement(LanguageSwitcher), "hi");
    assert.match(html, /role="group"/);
    assert.match(html, /aria-labelledby="language-switcher-label"/);
    assert.match(html, /aria-pressed="true"[^>]*aria-label="हिन्दी में देखें"/);
    assert.match(html, /aria-pressed="false"[^>]*aria-label="View the site in English"/);
    assert.match(html, /role="status"[^>]*aria-live="polite"/);
  });

  it("labels evidence fields, marks the required field, and announces results", () => {
    const html = renderWithLanguage(
      React.createElement(EvidencePdfBuilder),
      "en"
    );
    for (const id of [
      "incident-type",
      "playbook",
      "name",
      "contact",
      "time",
      "amount",
      "reference",
      "urls",
      "description",
      "findings",
    ]) {
      assert.match(html, new RegExp(`for="evidence-${id}"`));
      assert.match(html, new RegExp(`id="evidence-${id}"`));
    }
    assert.match(html, /id="evidence-description"[^>]*required=""/);
    assert.match(html, /aria-live="polite"/);
    assert.match(html, /PDF is generated in English/);
  });

  it("communicates URL danger with text as well as colour", () => {
    const report = getDemoUrlReport(
      "https://malware-demo.satark.example/download"
    );
    assert.ok(report);
    const en = renderWithLanguage(
      React.createElement(UrlResultCard, { report }),
      "en"
    );
    const hi = renderWithLanguage(
      React.createElement(UrlResultCard, { report }),
      "hi"
    );
    assert.match(en, /Malicious \(confirmed\)/);
    assert.match(hi, /दुर्भावनापूर्ण \(पुष्ट\)/);
    assert.equal(localizeSeverity("CRITICAL", "en"), "CRITICAL");
    assert.match(localizeSeverity("CRITICAL", "hi"), /गंभीर/);
  });

  it("keeps focus, skip-link, touch-target, and reduced-motion safeguards in CSS", () => {
    const css = source("../src/app/globals.css");
    const page = source("../src/app/page.tsx");
    assert.match(css, /:focus-visible/);
    assert.match(css, /outline:\s*3px solid/);
    assert.match(css, /\.skip-link:focus/);
    assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
    assert.match(css, /animation-duration: 0\.01ms/);
    assert.match(css, /@media \(pointer: coarse\)/);
    assert.match(page, /href="#main-content" className="skip-link"/);
    assert.match(page, /<main id="main-content" tabIndex=\{?-?\d*\}?/);
  });
});

describe("Phase 4 intro and reduced-motion decisions", () => {
  it("runs once per session, skips reduced motion, and treats malformed storage safely", () => {
    assert.equal(INTRO_SESSION_KEY, "satark_intro_seen");
    assert.equal(
      getIntroSkipReason({ reducedMotion: false, seen: false }),
      null
    );
    assert.equal(
      getIntroSkipReason({ reducedMotion: true, seen: false }),
      "reduced_motion"
    );
    assert.equal(
      getIntroSkipReason({ reducedMotion: false, seen: true }),
      "seen"
    );
    assert.equal(
      getIntroSkipReason({ reducedMotion: true, seen: true }),
      "reduced_motion"
    );
    assert.equal(hasSeenIntro("true"), true);
    assert.equal(hasSeenIntro("1"), true);
    assert.equal(hasSeenIntro("false"), false);
    assert.equal(hasSeenIntro(null), false);
  });

  it("keeps skip, Escape, dialog semantics, and direct 112 access in the intro", () => {
    const intro = source("../src/components/CinematicIntro.tsx");
    const layout = source("../src/app/layout.tsx");
    assert.match(intro, /aria-modal="true"/);
    assert.match(intro, /aria-describedby="satark-intro-description"/);
    assert.match(intro, /href="tel:112"/);
    assert.match(intro, /event\.key === "Escape"/);
    assert.match(intro, /ref=\{skipButtonRef\}/);
    assert.match(intro, /getIntroSkipReason/);
    assert.match(intro, /INTRO_SESSION_KEY/);
    assert.match(layout, /prefers-reduced-motion: reduce/);
    assert.match(layout, /satark_intro_seen/);
  });
});
