import { test } from "node:test";
import assert from "node:assert/strict";
import { validoProfilin, validoKerkesen, normalizoTelefonin, kaOferteParash } from "../src/lib/validimi.ts";

const forma = (o: Record<string, string>) => ({ get: (k: string) => o[k] ?? null });
const tani = new Date("2026-12-17T10:00:00Z");

test("telefoni normalizohet", () => {
  assert.equal(normalizoTelefonin("044 123-456"), "044123456");
  assert.equal(normalizoTelefonin("00383 44 123 456"), "+38344123456");
});

test("profili i vlefshëm", () => {
  const r = validoProfilin(forma({ emri: "Dreni", telefoni: "044 123 456", qyteti: "Prishtinë", gjinia: "M", grupi: "O-", dhurimi_fundit: "2026-06-01", njoftimet: "on" }), tani);
  assert.ok(r.ok);
  if (r.ok) { assert.equal(r.vlera.njoftimet, true); assert.equal(r.vlera.telefoni, "044123456"); }
});

test("profili refuzon grup, qytet dhe datë të pavlefshme", () => {
  const r = validoProfilin(forma({ emri: "D", telefoni: "abc", qyteti: "Paris", gjinia: "X", grupi: "Z+", dhurimi_fundit: "2027-01-01" }), tani);
  assert.equal(r.ok, false);
  if (!r.ok) assert.deepEqual(Object.keys(r.gabimet).sort(), ["dhurimi_fundit", "emri", "gjinia", "grupi", "qyteti", "telefoni"]);
});

const kerkesaOk = { grupi: "O-", spitali: "QKUK Prishtinë", qyteti: "Prishtinë", dozat: "2", afati: "2026-12-17T18:00:00Z", pershkrimi: "Kati përdhes.", telefoni_kontaktit: "044111222" };

test("kërkesa e vlefshme", () => {
  const r = validoKerkesen(forma(kerkesaOk), tani);
  assert.ok(r.ok);
});

test("kërkesa: dozat 1–10 dhe afati 30 min – 14 ditë", () => {
  let r = validoKerkesen(forma({ ...kerkesaOk, dozat: "11" }), tani);
  assert.ok(!r.ok && "dozat" in r.gabimet);
  r = validoKerkesen(forma({ ...kerkesaOk, afati: "2026-12-17T10:10:00Z" }), tani);
  assert.ok(!r.ok && "afati" in r.gabimet);
  r = validoKerkesen(forma({ ...kerkesaOk, afati: "2027-01-10T10:00:00Z" }), tani);
  assert.ok(!r.ok && "afati" in r.gabimet);
});

test("gjaku nuk shitet: refuzohen ofertat me para dhe lidhjet", () => {
  assert.ok(kaOferteParash("paguaj 50 euro"));
  assert.ok(kaOferteParash("shpërblim 100€"));
  assert.ok(kaOferteParash("Ofrojmë pagesë"), "fjalë që mbaron me ë");
  assert.ok(kaOferteParash("çmimi i dozës"));
  assert.ok(!kaOferteParash("Pacient në kirurgji, kati 2"));
  assert.ok(!kaOferteParash("Paraqituni te shesi i spitalit"), "‘shesi’ nuk është ‘shes’");
  let r = validoKerkesen(forma({ ...kerkesaOk, pershkrimi: "Ofrojmë pagesë" }), tani);
  assert.ok(!r.ok && "pershkrimi" in r.gabimet);
  r = validoKerkesen(forma({ ...kerkesaOk, pershkrimi: "shiko https://x.y" }), tani);
  assert.ok(!r.ok && "pershkrimi" in r.gabimet);
});
