import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  analyzeSuspiciousCall,
  checkPhoneFormat,
} from "../src/lib/help/phone.ts";

describe("Phase 3 phone number validation", () => {
  it("normalises an Indian mobile number without claiming identity verification", () => {
    const result = checkPhoneFormat("98765 43210");
    assert.equal(result.status, "valid");
    assert.equal(result.e164, "+919876543210");
    assert.equal(result.country, "IN");
    assert.equal(result.identityVerified, false);
    assert.equal(result.reputationChecked, false);
    assert.match(result.explanation, /not identity verification/i);
    assert.doesNotMatch(result.explanation, /this number is (?:safe|fraudulent)/i);
  });

  it("normalises an international number using its country code", () => {
    const result = checkPhoneFormat("+1 202 555 0143");
    assert.equal(result.status, "valid");
    assert.equal(result.e164, "+12025550143");
    assert.equal(result.country, "US");
    assert.equal(result.reputationChecked, false);
  });

  it("rejects malformed and impossible formats without inventing reputation", () => {
    const malformed = checkPhoneFormat("abc-123");
    assert.equal(malformed.status, "invalid");
    assert.equal(malformed.reputationChecked, false);

    const impossible = checkPhoneFormat("123");
    assert.equal(impossible.status, "invalid");
    assert.equal(impossible.reputationChecked, false);
    assert.match(impossible.explanation, /does not tell you whether a caller/i);
  });

  it("handles an empty number and allows description-only checks", () => {
    const result = checkPhoneFormat("");
    assert.equal(result.status, "not_provided");
    assert.equal(result.identityVerified, false);
    assert.equal(result.reputationChecked, false);
  });
});

describe("Phase 3 suspicious call analysis", () => {
  it("surfaces script warning signs without calling the number fraudulent", () => {
    const result = analyzeSuspiciousCall({
      phoneNumber: "+91 98765 43210",
      description:
        "The caller claimed to be CBI police, demanded I transfer money to a safe account, told me to stay on the call, and asked for my OTP.",
    });
    assert.equal(result.number.status, "valid");
    assert.equal(result.number.reputationChecked, false);
    assert.equal(result.number.identityVerified, false);
    assert.ok(result.signals.some((signal) => signal.id === "authority_impersonation"));
    assert.ok(result.signals.some((signal) => signal.id === "credential_request"));
    assert.ok(result.signals.some((signal) => signal.id === "payment_demand"));
    assert.ok(result.nextSteps.some((step) => /1930/.test(step)));
    assert.ok(result.resources.some((resource) => resource.id === "helpline1930"));
    assert.match(result.notes.join(" "), /does not check caller identity/i);
  });

  it("handles an ordinary description without declaring the call safe", () => {
    const result = analyzeSuspiciousCall({
      phoneNumber: "+919876543210",
      description: "The caller asked me to confirm a delivery address.",
    });
    assert.equal(result.signals.length, 0);
    assert.match(result.notes.join(" "), /not a trust score/i);
    assert.match(result.notes.join(" "), /not proof/i);
    assert.equal(result.number.reputationChecked, false);
    assert.ok(result.resources.some((resource) => resource.id === "sancharSaathi"));
  });

  it("does not treat the everyday word fine as a payment demand", () => {
    const result = analyzeSuspiciousCall({
      description: "The caller said he is fine and will call again tomorrow.",
    });
    assert.ok(!result.signals.some((signal) => signal.id === "payment_demand"));
  });

  it("adds emergency and threat guidance for threatening calls", () => {
    const result = analyzeSuspiciousCall({
      description:
        "They threatened to leak my private photos and demanded payment, then said they would hurt me if I told anyone.",
    });
    assert.ok(result.signals.some((signal) => signal.id === "threat_or_extortion"));
    assert.ok(result.nextSteps.some((step) => /call 112/i.test(step)));
    assert.ok(result.resources.some((resource) => resource.id === "emergency112"));
  });

  it("handles empty phone and description without throwing", () => {
    const result = analyzeSuspiciousCall({});
    assert.equal(result.number.status, "not_provided");
    assert.equal(result.signals.length, 0);
    assert.equal(result.descriptionWasProvided, false);
    assert.ok(result.nextSteps.length > 0);
    assert.equal(result.number.identityVerified, false);
    assert.equal(result.number.reputationChecked, false);
  });

  it("does not expose a reputation verdict in the result", () => {
    const result = analyzeSuspiciousCall({
      phoneNumber: "+919876543210",
      description: "The caller asked for an OTP and a UPI transfer.",
    });
    const serialized = JSON.stringify(result);
    assert.doesNotMatch(serialized, /isFraud|fraudScore|reputationScore|confirmed scam number/i);
    assert.match(serialized, /"reputationChecked":false/);
  });
});
