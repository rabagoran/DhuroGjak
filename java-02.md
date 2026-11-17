# DhuroGjak — Java 2: Nga ideja te plani

## Skenari

Arta ka babain në QKUK Prishtinë. Mjeku thotë se nevojiten **2 doza O-** deri sot në **18:00**. Dreni ka grupin **O-**, jeton në Prishtinë dhe dhuroi para 5 muajsh. Aplikacioni duhet t’i lidhë këta dy persona brenda pak minutash.

## Përdoruesit

- **Kërkuesi** (Arta): poston kërkesën dhe ndjek sa dhurues janë nisur.
- **Dhuruesi** (Dreni): merr njoftim vetëm kur mund të ndihmojë dhe shtyp “Do të shkoj”.

## Tri veçoritë e MVP-së

1. **Lista e kërkesave aktive** me grupin, spitalin, qytetin, afatin dhe progresin “X nga Y dhurues”.
2. **Detajet e kërkesës** me URL unike (`/kerkesa/[id]`) dhe butonin “Do të shkoj”.
3. **Ekrani “Pranuar · në pritje”** që konfirmon pjesëmarrjen dhe tregon kontaktin vetëm pas pranimit.

## Çfarë mbetet jashtë MVP-së

- Shpërblimet nga partnerët.
- Chat brenda aplikacionit.
- Lidhja me sistemin zyrtar të Qendrës Kombëtare të Transfuzionit.

## Skica

Skica e tre ekraneve është te `skica.svg` (lista, detajet, pranuar/në pritje).

> **Për dorëzim:** profi kërkon `skica.jpg` ose `skica.png`. Vizato të njëjtat tri ekrane në letër, bëji foto të lexueshme dhe ruaje si `skica.jpg` në root të repository-t. Skica SVG shërben si model.

## Prova me shokun e klasës

**Detyra pa ndihmë:** “Gjej një kërkesë për O- në Prishtinë dhe trego si do të pranoje.”

| Pyetja | Rezultati real |
|---|---|
| E gjeti kërkesën pa ndihmë? | _(plotëso pas provës)_ |
| Ku ngeci? | _(plotëso pas provës)_ |
| Çfarë ndryshova në skicë pas provës? | _(plotëso pas provës)_ |

## Si do të testohet MVP

1. Hap listën në telefon: kartat lexohen pa scroll horizontal.
2. Kliko një kartë: detajet përputhen me kartën (grupi, spitali, dozat).
3. Kliko “Do të shkoj”: ekrani i pritjes shfaqet dhe numëruesi rritet me 1.
