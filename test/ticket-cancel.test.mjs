import assert from "node:assert/strict";
import { test } from "node:test";

import { cancelCopy, cancelOutcomeFor, cancelProblem, ticketCancelUrl } from "../src/lib/ticket-cancel.ts";

test("the cancel route is core's public one", () => {
  assert.equal(
    ticketCancelUrl("https://api.yildizskylab.com", "K7M2QXZFABCDEFGHJKLMNPQRST"),
    "https://api.yildizskylab.com/v1/public/tickets/K7M2QXZFABCDEFGHJKLMNPQRST/cancel",
  );
});

test("an answer becomes an outcome", () => {
  assert.deepEqual(cancelOutcomeFor(200, { state: "ticket_cancelled" }), { kind: "cancelled" });
  assert.deepEqual(cancelOutcomeFor(409, { code: "ticket_in_competition" }), {
    kind: "refused",
    code: "ticket_in_competition",
  });
  assert.deepEqual(cancelOutcomeFor(409, null), { kind: "refused", code: null });
  assert.deepEqual(cancelOutcomeFor(410, null), { kind: "not-found" });
  assert.deepEqual(cancelOutcomeFor(503, null), { kind: "failed" });
});

test("each refusal has its own sentence", () => {
  assert.equal(cancelProblem({ kind: "cancelled" }), null);
  assert.equal(
    cancelProblem({ kind: "refused", code: "ticket_cancel_closed" }),
    "Etkinlik başladı; bilet artık iptal edilemez.",
  );
  assert.equal(cancelProblem({ kind: "refused", code: "ticket_checked_in" }), "Girişin yazılmış; bilet iptal edilemez.");
  assert.equal(
    cancelProblem({ kind: "refused", code: "ticket_in_competition" }),
    "Yarışmaya kayıtlısın; bilet iptal edilemez.",
  );
  assert.equal(cancelProblem({ kind: "refused", code: null }), "Bilet iptal edilemez.");
  assert.equal(cancelProblem({ kind: "limited" }), "Çok fazla deneme. Biraz sonra yeniden dene.");
  assert.equal(cancelProblem({ kind: "failed" }), "Bilet iptal edilemedi. Biraz sonra yeniden dene.");
});

test("the waiting list leaves the list, an active ticket is cancelled", () => {
  assert.equal(cancelCopy(false).button, "Biletimi iptal et");
  assert.equal(cancelCopy(false).detail, "Biletin iptal edilecek. Geri almak için düzenleyene yazman gerekir.");
  assert.equal(cancelCopy(true).button, "Listeden çık");
  assert.equal(cancelCopy(true).action, "Listeden çık");
});
