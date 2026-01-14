# 📦 Voorraad Scan & Telling App – Handleiding

## Doel van deze app

Deze web-app wordt gebruikt om **equipment op locatie te tellen** door middel van het scannen van barcodes/QR-codes en deze te vergelijken met een **Excel-lijst**.

De app houdt automatisch bij:

* Wat er **wel** gescand is
* Wat er **ontbreekt**
* Welke scans **onbekend** zijn

De app ondersteunt equipmentnummers met de prefixes **IDT** en **EQN**, die door een fusie van twee bedrijven naast elkaar bestaan.

---

## 🔑 Belangrijkste uitgangspunten

* De **Excel-kolom `Equipment#`** is altijd leidend
* In Excel staan **geen URL’s**
* Tijdens het scannen kan:

  * een **URL** voorkomen
  * een nummer **zonder IDT/EQN** voorkomen
* De app corrigeert dit automatisch

---

## 🗂 Vereisten

* Een Excel-bestand (`.xlsx`)
* Een barcode-/QR-scanner
  *(scanner werkt als toetsenbord + Enter)*
* Een moderne browser (Chrome, Edge)

---

## 📥 Stap 1 – Excel uploaden

1. Open de app
2. Upload het Excel-bestand
3. De app herkent automatisch de kolom **`Equipment#`**
4. Extra kolommen zoals **Cat** en **Class** worden automatisch meegenomen

Na upload zie je een tabel met:

* Equipment#
* Cat
* Class
* Geteld (start op 0)

---

## 📡 Stap 2 – Scannen

Klik in het **scanveld** (staat standaard al actief) en begin met scannen.

### Wat gebeurt er bij elke scan?

#### 1️⃣ URL wordt genegeerd

Als je dit scant:

```
https://eqin.centix.com/object/249bq-g0X/3105123
```

Dan gebruikt de app alleen:

```
3105123
```

---

#### 2️⃣ Nummer wordt opgeschoond

* Spaties weg
* Hoofdletters
* Alleen letters en cijfers

---

#### 3️⃣ Slimme matching (heel belangrijk)

De app probeert **altijd in deze volgorde**:

1. **Exact match** met `Equipment#`
2. Geen match?

   * Is het **7 cijfers** → probeer:

     * `IDTxxxxxxx`
     * `EQNxxxxxxx`
3. Scan begint met `IDT` of `EQN`?

   * Dan probeert hij ook:

     * zonder prefix
     * met de **andere prefix**

✅ Voorbeelden:

* Scan: `3105123` → matcht `IDT3105123` of `EQN3105123`
* Scan: `IDT3105123` → matcht ook `EQN3105123`
* Scan: `EQN3105123` → matcht ook `IDT3105123`

---

#### 4️⃣ Resultaat

* **Match gevonden** → `Geteld +1`
* **Geen match** → komt in **Onbekende scans**

Je krijgt altijd een melding (toast) met:

* gevonden equipment
* nieuw geteld aantal
  of
* melding dat het onbekend is

---

## 📊 Filters & overzicht

Boven de tabel kun je:

* Filteren op **Cat**
* Filteren op **Class**
* Zoeken op **Equipment#**

Dit is handig bij grote lijsten of categorie-tellingen.

---

## 📤 Exporteren

### Resultaat export

Je kunt het resultaat exporteren naar Excel met:

* Alle originele kolommen
* `Geteld`
* `MatchedFrom` (welke scan heeft gematcht)

### Onbekende scans

Onbekende scans zijn apart te downloaden met:

* Originele scan
* Genormaliseerde waarde
* Tijdstip

---

## 🔄 Reset telling

Met **Reset tellingen**:

* worden alle `Geteld` waarden weer 0
* Excel blijft ongewijzigd

---

## 💾 Gegevens blijven bewaard

* Tellingen worden lokaal opgeslagen in de browser
* Pagina verversen = **geen data kwijt**
* Alleen reset of nieuwe Excel wist tellingen

---

## 🖼 App-overzicht

(Automatische preview van de app)

![App screenshot](https://screenshot2.lovable.dev/e294cbfd-959b-4eea-a1f1-98b787a5920f/id-preview-95fadc6b--1e34b315-cfbe-45b9-b3d7-7a13da54049f.lovable.app-1768371219864.png)

---

## ✅ Samenvatting

✔ Ondersteunt IDT & EQN
✔ Negeert URL’s automatisch
✔ Slimme matching bij oude nummers
✔ Perfect voor inventaris & locatiecontrole

---
