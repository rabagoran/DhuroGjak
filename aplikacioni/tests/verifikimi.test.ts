import { test } from "node:test";
import assert from "node:assert/strict";
import { statusiFillestar, mundTeVerifikoje, mundTeShikoje, mundTeRaportoje, eshteStafi, type Aktor } from "../src/lib/verifikimi.ts";

const familja: Aktor = { id: "github:1", roli: "perdorues", spitali_id: null };
const stafiQKUK: Aktor = { id: "github:2", roli: "spital", spitali_id: "qktgj" };
const stafiPeje: Aktor = { id: "github:3", roli: "spital", spitali_id: "peje" };
const admini: Aktor = { id: "github:4", roli: "admin", spitali_id: null };
const dhuruesi: Aktor = { id: "github:5", roli: "perdorues", spitali_id: null };

const nePritje = { statusi: "ne_verifikim", pezulluar: false, krijuar_nga: "github:1", spitali_id: "qktgj" };
const aktive = { ...nePritje, statusi: "aktive" };

test("familja poston → në pritje (asnjë dhurues nuk njoftohet pa verifikim)", () => {
  assert.equal(statusiFillestar(familja, "qktgj"), "ne_verifikim");
});

test("stafi i po atij spitali poston → aktive menjëherë; i një spitali tjetër → në pritje", () => {
  assert.equal(statusiFillestar(stafiQKUK, "qktgj"), "aktive");
  assert.equal(statusiFillestar(stafiPeje, "qktgj"), "ne_verifikim");
  assert.equal(statusiFillestar(admini, "peje"), "aktive");
});

test("vetëm stafi i spitalit të kërkesës verifikon", () => {
  assert.ok(mundTeVerifikoje(stafiQKUK, nePritje));
  assert.ok(!mundTeVerifikoje(stafiPeje, nePritje), "stafi i spitalit tjetër s'mund të verifikojë");
  assert.ok(!mundTeVerifikoje(familja, nePritje), "kërkuesi s'mund ta verifikojë vetë");
  assert.ok(!mundTeVerifikoje(null, nePritje));
  assert.ok(mundTeVerifikoje(admini, nePritje));
  assert.ok(!mundTeVerifikoje(stafiQKUK, aktive), "e verifikuara s'verifikohet sërish");
});

test("kërkesa në pritje nuk është publike", () => {
  assert.ok(!mundTeShikoje(null, nePritje));
  assert.ok(!mundTeShikoje(dhuruesi, nePritje));
  assert.ok(mundTeShikoje(familja, nePritje), "kërkuesi e sheh të vetën");
  assert.ok(mundTeShikoje(stafiQKUK, nePritje));
  assert.ok(!mundTeShikoje(stafiPeje, nePritje));
  assert.ok(mundTeShikoje(null, aktive));
  assert.ok(!mundTeShikoje(dhuruesi, { ...aktive, pezulluar: true }), "e pezulluara fshihet");
  assert.ok(!mundTeShikoje(dhuruesi, { ...nePritje, statusi: "refuzuar" }));
});

test("raportimi: jo pa hyrje, jo për kërkesën e vet, jo nga stafi", () => {
  assert.ok(mundTeRaportoje(dhuruesi, aktive));
  assert.ok(!mundTeRaportoje(null, aktive));
  assert.ok(!mundTeRaportoje(familja, aktive));
  assert.ok(!mundTeRaportoje(stafiQKUK, aktive));
  assert.ok(!mundTeRaportoje(dhuruesi, nePritje));
});

test("eshteStafi kërkon spital të njëjtë", () => {
  assert.ok(eshteStafi(stafiQKUK, { spitali_id: "qktgj" }));
  assert.ok(!eshteStafi(stafiQKUK, { spitali_id: null }));
  assert.ok(!eshteStafi({ id: "x", roli: "spital", spitali_id: null }, { spitali_id: null }));
});
