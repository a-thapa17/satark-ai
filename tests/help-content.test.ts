import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  OFFICIAL_RESOURCES,
  getOfficialResource,
} from "../src/lib/help/resources.ts";
import {
  SAFETY_PLAYBOOKS,
  getPlaybook,
  isPlaybookId,
} from "../src/lib/help/playbooks.ts";
import {
  EMERGENCY_SCENARIOS,
  buildEmergencyPlan,
  getEmergencyScenario,
} from "../src/lib/help/scenarios.ts";

describe("Phase 3 official help resources", () => {
  it("contains unique, verified-style official channels with safe scopes", () => {
    const ids = new Set(OFFICIAL_RESOURCES.map((resource) => resource.id));
    assert.equal(ids.size, OFFICIAL_RESOURCES.length);
    assert.equal(OFFICIAL_RESOURCES.length, 7);

    for (const resource of OFFICIAL_RESOURCES) {
      assert.match(resource.url, /^https:\/\//, `${resource.id} must use HTTPS`);
      assert.ok(resource.name.length > 0);
      assert.ok(resource.description.length > 0);
      assert.ok(resource.source.length > 0);
      assert.match(resource.verifiedOn, /^\d{4}-\d{2}-\d{2}$/);
    }

    assert.equal(getOfficialResource("helpline1930")?.phone, "1930");
    assert.equal(
      getOfficialResource("cybercrimePortal")?.url,
      "https://cybercrime.gov.in/"
    );
    assert.equal(getOfficialResource("emergency112")?.phone, "112");
    assert.equal(getOfficialResource("uidai")?.phone, "1947");
    assert.match(
      getOfficialResource("sancharSaathi")?.importantLimit ?? "",
      /not a financial-fraud/i
    );
  });

  it("does not promise recovery or a submitted report", () => {
    for (const resource of OFFICIAL_RESOURCES) {
      assert.doesNotMatch(
        `${resource.description} ${resource.importantLimit ?? ""}`,
        /money will (?:definitely )?be recovered|guaranteed recovery/i
      );
    }
  });
});

describe("Phase 3 safety playbooks", () => {
  it("covers all six required scenarios with complete sections", () => {
    assert.equal(SAFETY_PLAYBOOKS.length, 6);
    const expected = new Set([
      "upi_payment_fraud",
      "phishing_links",
      "account_compromise",
      "identity_theft",
      "shopping_fraud",
      "threats_extortion",
    ]);
    assert.deepEqual(
      new Set(SAFETY_PLAYBOOKS.map((playbook) => playbook.id)),
      expected
    );

    for (const playbook of SAFETY_PLAYBOOKS) {
      assert.ok(isPlaybookId(playbook.id));
      assert.equal(getPlaybook(playbook.id)?.title, playbook.title);
      assert.ok(playbook.immediateActions.length >= 3, playbook.id);
      assert.ok(playbook.evidenceToPreserve.length >= 2, playbook.id);
      assert.ok(playbook.accountsToSecure.length >= 2, playbook.id);
      assert.ok(playbook.reportingOptions.length >= 2, playbook.id);
      assert.ok(playbook.mistakesToAvoid.length >= 3, playbook.id);
      assert.ok(playbook.reportingOptions.some((option) => option.resourceIds.length > 0));

      for (const option of playbook.reportingOptions) {
        for (const resourceId of option.resourceIds) {
          assert.ok(
            getOfficialResource(resourceId),
            `${playbook.id} references missing resource ${resourceId}`
          );
        }
      }
    }
  });

  it("rejects unknown playbook ids", () => {
    assert.equal(isPlaybookId("not-a-playbook"), false);
    assert.equal(getPlaybook("not-a-playbook" as never), undefined);
  });
});

describe("Phase 3 emergency plan routing", () => {
  it("covers all five emergency scenarios and links to known resources", () => {
    assert.equal(EMERGENCY_SCENARIOS.length, 5);
    for (const scenario of EMERGENCY_SCENARIOS) {
      assert.equal(getEmergencyScenario(scenario.id)?.title, scenario.title);
      assert.ok(scenario.immediateActions.length >= 3);
      assert.ok(scenario.evidenceToPreserve.length >= 2);
      assert.ok(scenario.reportingOptions.length >= 2);
      assert.ok(scenario.playbookIds.every((id) => getPlaybook(id)));

      for (const option of scenario.reportingOptions) {
        for (const resourceId of option.resourceIds) {
          assert.ok(getOfficialResource(resourceId));
        }
      }
    }
  });

  it("puts 112 first when there is immediate danger", () => {
    const plan = buildEmergencyPlan({
      scenario: "threats_extortion",
      immediateDanger: true,
    });
    assert.equal(plan.urgency, "immediate");
    assert.match(plan.steps[0]?.detail ?? "", /call 112/i);
    assert.ok(plan.resources.some((resource) => resource.id === "emergency112"));
    assert.ok(plan.resources.some((resource) => resource.id === "cybercrimePortal"));
  });

  it("adds bank and 1930 steps for money loss without promising recovery", () => {
    const plan = buildEmergencyPlan({
      scenario: "financial_fraud",
      moneyLost: true,
    });
    const combined = plan.steps.map((step) => `${step.title} ${step.detail}`).join(" ");
    assert.match(combined, /bank/i);
    assert.match(combined, /1930/);
    assert.match(plan.noReportSubmitted, /has not submitted a report/i);
    assert.match(plan.recoveryDisclaimer, /not guaranteed/i);
    assert.ok(plan.resources.some((resource) => resource.id === "helpline1930"));
    assert.ok(plan.resources.some((resource) => resource.id === "cybercrimePortal"));
    assert.match(plan.finalStep, /not guaranteed/i);
  });

  it("does not add the immediate money-loss path when no money was lost", () => {
    const plan = buildEmergencyPlan({
      scenario: "account_compromise",
      moneyLost: false,
    });
    assert.doesNotMatch(
      plan.steps.map((step) => step.detail).join(" "),
      /money has moved|stop the loss/i
    );
    assert.equal(plan.urgency, "urgent");
  });

  it("rejects an unknown scenario safely", () => {
    assert.throws(
      () =>
        buildEmergencyPlan({
          scenario: "unknown" as never,
        }),
      /Unknown emergency scenario/
    );
  });
});
