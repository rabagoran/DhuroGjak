// Qendrat e transfuzionit / bankat e gjakut në Kosovë.
// KUJDES: koordinatat janë të përafërta (qendra e spitalit). Verifiko adresën dhe orarin para publikimit.

export type Qendra = {
  id: string;
  emri: string;
  qyteti: string;
  adresa: string;
  lat: number;
  lng: number;
};

export const QENDRAT: readonly Qendra[] = [
  { id: "qktgj", emri: "Qendra Kombëtare e Transfuzionit të Gjakut", qyteti: "Prishtinë", adresa: "Kompleksi i QKUK-së, Prishtinë", lat: 42.6489, lng: 21.1566 },
  { id: "peje", emri: "Spitali Rajonal Pejë — Transfuzioni", qyteti: "Pejë", adresa: "Spitali Rajonal, Pejë", lat: 42.6593, lng: 20.2887 },
  { id: "prizren", emri: "Spitali Rajonal Prizren — Transfuzioni", qyteti: "Prizren", adresa: "Spitali Rajonal, Prizren", lat: 42.2153, lng: 20.7361 },
  { id: "gjakove", emri: "Spitali Rajonal Gjakovë — Transfuzioni", qyteti: "Gjakovë", adresa: "Spitali Rajonal, Gjakovë", lat: 42.3803, lng: 20.4309 },
  { id: "gjilan", emri: "Spitali Rajonal Gjilan — Transfuzioni", qyteti: "Gjilan", adresa: "Spitali Rajonal, Gjilan", lat: 42.4636, lng: 21.4694 },
  { id: "ferizaj", emri: "Spitali Rajonal Ferizaj — Transfuzioni", qyteti: "Ferizaj", adresa: "Spitali Rajonal, Ferizaj", lat: 42.3707, lng: 21.1553 },
  { id: "mitrovice", emri: "Spitali Rajonal Mitrovicë — Transfuzioni", qyteti: "Mitrovicë", adresa: "Spitali Rajonal, Mitrovicë", lat: 42.8833, lng: 20.8667 },
];

/** Qendrat e përafërta të qyteteve, për zgjedhjen manuale kur GPS refuzohet. */
export const QENDRA_E_QYTETIT: Record<string, [number, number]> = {
  "Prishtinë": [42.6629, 21.1655], "Fushë Kosovë": [42.6364, 21.0953], "Obiliq": [42.6869, 21.0703],
  "Lipjan": [42.5217, 21.1258], "Graçanicë": [42.6000, 21.1933], "Podujevë": [42.9106, 21.1931],
  "Drenas": [42.6236, 20.8939], "Ferizaj": [42.3702, 21.1483], "Shtime": [42.4331, 21.0397],
  "Kaçanik": [42.2319, 21.2592], "Gjilan": [42.4635, 21.4694], "Viti": [42.3214, 21.3581],
  "Kamenicë": [42.5781, 21.5803], "Prizren": [42.2139, 20.7397], "Suharekë": [42.3589, 20.8250],
  "Rahovec": [42.3992, 20.6547], "Dragash": [42.0625, 20.6533], "Malishevë": [42.4822, 20.7458],
  "Gjakovë": [42.3803, 20.4308], "Deçan": [42.5403, 20.2878], "Pejë": [42.6591, 20.2883],
  "Istog": [42.7808, 20.4875], "Klinë": [42.6217, 20.5778], "Skënderaj": [42.7381, 20.7897],
  "Vushtrri": [42.8231, 20.9675], "Mitrovicë": [42.8914, 20.8660],
};

/** Distanca në km (formula Haversine). */
export function distancaKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function renditSipasDistances(pika: [number, number]) {
  return QENDRAT.map((q) => ({ ...q, km: distancaKm(pika, [q.lat, q.lng]) })).sort((x, y) => x.km - y.km);
}
