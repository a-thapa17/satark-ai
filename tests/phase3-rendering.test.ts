import { describe, it } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import HelpHub from "../src/components/help/HelpHub.tsx";
import EmergencyAssistant from "../src/components/help/EmergencyAssistant.tsx";
import PlaybookLibrary from "../src/components/help/PlaybookLibrary.tsx";
import PhoneCallChecker from "../src/components/help/PhoneCallChecker.tsx";
import EvidencePdfBuilder from "../src/components/help/EvidencePdfBuilder.tsx";

function render(component: React.ReactElement): string {
  return renderToStaticMarkup(component);
}

describe("Phase 3 help rendering", () => {
  it("renders an accessible emergency help hub with official entry points", () => {
    const html = render(React.createElement(HelpHub));
    assert.match(html, /id="emergency-help"/);
    assert.match(html, /role="tablist"/);
    assert.match(html, /aria-label="Emergency and safety help tools"/);
    assert.match(html, /Emergency guidance/);
    assert.match(html, /Safety playbooks/);
    assert.match(html, /Phone check/);
    assert.match(html, /Evidence PDF/);
    assert.match(html, /Call 112/);
    assert.match(html, /Call 1930/);
    assert.match(html, /does not call, submit, or contact anyone for you/i);
    for (const panel of ["emergency", "playbooks", "phone", "evidence"]) {
      assert.match(html, new RegExp(`id="help-panel-${panel}"`));
      assert.match(html, new RegExp(`aria-controls="help-panel-${panel}"`));
    }
    assert.doesNotMatch(html, /report submitted successfully/i);
  });

  it("renders the emergency scenario selector and safety checks", () => {
    const html = render(React.createElement(EmergencyAssistant));
    assert.match(html, /Immediate danger comes first/);
    assert.match(html, /Money has already left my account/);
    assert.match(html, /Money or financial details were taken/);
    assert.match(html, /I was targeted by an online scam/);
    assert.match(html, /My account was hacked or taken over/);
    assert.match(html, /Someone is using my identity/);
    assert.match(html, /I am being threatened or blackmailed/);
    assert.match(html, /Show my action plan/);
    assert.doesNotMatch(html, /report submitted successfully/i);
  });

  it("renders all six reusable playbooks and required sections", () => {
    const html = render(React.createElement(PlaybookLibrary));
    assert.match(html, /UPI \/ payment fraud/);
    assert.match(html, /Phishing links/);
    assert.match(html, /Account hacked/);
    assert.match(html, /Identity theft/);
    assert.match(html, /Shopping fraud/);
    assert.match(html, /Threats \/ sextortion/);
    assert.match(html, /Immediate actions/);
    assert.match(html, /Evidence to preserve/);
    assert.match(html, /Accounts and services to secure/);
    assert.match(html, /Mistakes to avoid/);
    assert.match(html, /Reporting options/);
    assert.doesNotMatch(html, /guaranteed refund|guaranteed recovery|we will recover/i);
  });

  it("renders the phone checker without a reputation claim", () => {
    const html = render(React.createElement(PhoneCallChecker));
    assert.match(html, /Check a suspicious call/);
    assert.match(html, /A format check is not a background check/);
    assert.match(html, /No caller reputation data is available/i);
    assert.match(html, /will not label a number fraudulent from its format/i);
    assert.doesNotMatch(html, /number is fraudulent/i);
    assert.doesNotMatch(html, /confirmed scam number/i);
  });

  it("renders the evidence builder with no-submission and secret warnings", () => {
    const html = render(React.createElement(EvidencePdfBuilder));
    assert.match(html, /Build an evidence summary/);
    assert.match(html, /What the PDF will contain/);
    assert.match(html, /No report is submitted/);
    assert.match(html, /not an acknowledgement from any authority/i);
    assert.match(html, /Do not enter OTPs, passwords, UPI PINs, CVVs/i);
    assert.match(html, /Download evidence PDF/);
  });
});
