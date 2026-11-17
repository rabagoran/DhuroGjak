// Java 14 — tri rastet e kërkuara: kërkesë e suksesshme, pa vende, veprim pa leje.
import { test } from "node:test";
import assert from "node:assert/strict";
import { vendosPergjigjen, type DhuruesPerVendim, type KerkesePerVendim } from "../src/lib/rregullat.ts";

const tani = new Date("2026-12-17T10:00:00Z");
const kerkesa: KerkesePerVendim = {
  grupi: "A+", statusi: "aktive", afati: "2026-12-17T18:00:00Z", dozat: 2, pranuar: 0, krijuar_nga: "github:1",
};
const dreni: DhuruesPerVendim = {
  id: "github:2", grupi: "O-", gjinia: "M", telefoni: "38344222222", qyteti: "Prishtinë", dhurimi_fundit: "2026-06-01",
};

test("kërkesë e suksesshme: dhurues O- i lejuar pranon kërkesën A+", () => {
  assert.equal(vendosPergjigjen(dreni, kerkesa, { tani }), "ok");
});

test("pa vende: kur dozat janë mbuluar, përgjigjja refuzohet me 'plot'", () => {
  assert.equal(vendosPergjigjen(dreni, { ...kerkesa, pranuar: 2 }, { tani }), "plot");
});

test("pa leje: përdoruesi pa hyrë merr 'hyr'", () => {
  assert.equal(vendosPergjigjen(null, kerkesa, { tani }), "hyr");
});

test("pa leje: kërkuesi nuk mund t'i përgjigjet kërkesës së vet", () => {
  assert.equal(vendosPergjigjen({ ...dreni!, id: "github:1" }, kerkesa, { tani }), "pronar");
});

test("grup i papërputhshëm: A+ nuk i jep O-", () => {
  assert.equal(vendosPergjigjen({ ...dreni!, grupi: "A+" }, { ...kerkesa, grupi: "O-" }, { tani }), "grupi");
});

test("bllokuar: mashkull që dhuroi 30 ditë më parë", () => {
  assert.equal(vendosPergjigjen({ ...dreni!, dhurimi_fundit: "2026-11-17" }, kerkesa, { tani }), "bllokuar");
});

test("kërkesë e mbyllur ose e skaduar", () => {
  assert.equal(vendosPergjigjen(dreni, { ...kerkesa, statusi: "perfunduar" }, { tani }), "mbyllur");
  assert.equal(vendosPergjigjen(dreni, { ...kerkesa, afati: "2026-12-17T09:00:00Z" }, { tani }), "mbyllur");
});

test("profili i paplotë dhe pranim i dyfishtë", () => {
  assert.equal(vendosPergjigjen({ ...dreni!, telefoni: null }, kerkesa, { tani }), "profili");
  assert.equal(vendosPergjigjen(dreni, kerkesa, { tani, kaPranuar: true }), "ekziston");
});
