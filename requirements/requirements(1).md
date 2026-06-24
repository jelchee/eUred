# Requirements.md — Digital Battery Passport & Lifecycle Data Platform Pilot

**Projekt:** Battery Passport & Lifecycle Data Platform for Rimac Energy SineStack  
**Partneri:** Ericsson Nikola Tesla d.d. + Rimac Energy / Rimac Technology  
**Tip dokumenta:** MVP/Pilot product requirements  
**Verzija:** 1.0  
**Datum:** 2026-06-24  
**Status:** Draft za inicijalni poslovno-tehnički razgovor  
**Napomena:** Svi podaci u ovom dokumentu su **testni, sintetički i realistični**, osim javno poznatih regulatornih i proizvodnih pretpostavki navedenih u odjeljku “Izvori i pretpostavke”. Dokument nije pravni savjet niti službena interpretacija EU regulative.

---

## 1. Sažetak pilota

Pilot demonstrira digitalnu platformu za **EU Battery Passport**, lifecycle traceability, ESG izvještavanje i operativni nadzor baterijskih energy storage sustava. Fokus je na Rimac Energy SineStack sustavu kao referentnom industrijskom/stacionarnom BESS assetu, dok Ericsson Nikola Tesla demonstrira vrijednost kroz sigurnu digitalnu platformu, IoT/telemetry integraciju, API sloj, role-based pristup, audit trail i atraktivno moderno sučelje.

Cilj pilota nije izgraditi kompletan regulatorno certificiran proizvod, nego pokazati da partneri mogu u 12–16 tjedana napraviti uvjerljiv MVP koji odgovara na pitanje:

> “Kako bi izgledao compliance-ready, secure, connected i AI-ready digital battery passport za europski BESS proizvod?”

---

## 2. Izvori i pretpostavke

### 2.1 Regulatorne pretpostavke

Pilot se orijentira prema zahtjevima EU Battery Regulation 2023/1542, posebno prema konceptu elektroničkog battery passporta za EV baterije, LMT baterije i industrijske baterije kapaciteta iznad 2 kWh od 18. veljače 2027. Relevantne teme uključuju:

- jedinstveni digitalni identitet baterije,
- QR kod ili drugi data carrier,
- strukturirani, strojno čitljiv i interoperabilan zapis,
- različite razine pristupa podacima,
- podatke o modelu baterije i pojedinačnoj bateriji,
- carbon footprint,
- due diligence i recycled content podatke,
- performance, durability i state-of-health podatke,
- auditabilnost i kontrolu izmjena.

Za praktično mapiranje atributa pilot koristi logiku Battery Pass / DIN DKE SPEC 99100 pristupa, ali se u MVP-u implementira samo reprezentativni podskup podataka.

### 2.2 Javne proizvodne pretpostavke za Rimac Energy SineStack

Za demo se koristi javno komunicirana logika SineStack proizvoda:

- fully integrated C&I BESS,
- približno 868 kWh iz jednog 2-hour AC blocka,
- 400 Vac, 3-phase output,
- oko 92% round-trip efficiency,
- do 12.000 ciklusa,
- granularna softverska kontrola i integrirani BMS/Battery Intelligence sloj,
- LFP kemija kao pretpostavka za demo dataset.

### 2.3 Pretpostavke o ulozi Ericsson Nikola Tesla

Ericsson Nikola Tesla u pilotu demonstrira:

- secure cloud/edge platform engineering,
- IoT/telemetry ingestion,
- API gateway i integracije,
- identity and access management,
- cybersecurity i audit trail,
- dashboarding i managed operations koncept,
- opcionalnu poveznicu s private 4G/5G connectivity scenarijem.

---

## 3. Ciljevi pilota

### 3.1 Primarni ciljevi

1. Prikazati digitalni battery passport za jedan ili više SineStack asseta.
2. Pokazati kako se statični proizvodni podaci, compliance podaci i dinamička BMS/telemetry mjerenja spajaju u jedan lifecycle record.
3. Omogućiti različite poglede za javnost, kupca, servisera, regulatora, recyclera i platform operatera.
4. Detektirati compliance gaps: koji passport atributi su popunjeni, djelomični, nedostaju ili čekaju verifikaciju.
5. Demonstrirati business vrijednost: brže izvještavanje, bolji servis, jasnija rezidualna vrijednost asseta, ESG transparentnost i readiness za EU tržište.

### 3.2 Sekundarni ciljevi

1. Pripremiti referentnu arhitekturu za skaliranje na više BESS lokacija.
2. Pokazati potencijal za white-label platformu za druge proizvođače baterija i storage integratore.
3. Pripremiti demo koji je dovoljno vizualno atraktivan za board-level i partner prezentacije.
4. Omogućiti realističan testni dataset bez korištenja stvarnih Rimac/ENT povjerljivih podataka.

---

## 4. Out of scope za pilot

Pilot ne uključuje:

- formalnu pravnu certifikaciju battery passporta,
- punu implementaciju svih EU Battery Regulation atributa,
- stvarnu integraciju s proizvodnim MES/ERP sustavom,
- stvarnu integraciju s Rimac Energy BMS sustavom,
- stvarni pristup regulatornim bazama,
- live OT/SCADA kontrolu baterije,
- komercijalni SLA,
- stvarne dobavljačke, troškovne ili IP-osjetljive podatke.

Sve integracije se simuliraju putem testnih API-ja, mock podataka i demo seeding skripte.

---

## 5. Ključni korisnici i persone

### 5.1 Public Viewer

**Opis:** Osoba koja skenira QR kod na baterijskom sustavu.  
**Cilj:** Vidjeti osnovne javne informacije o bateriji bez prijave.

Može vidjeti:

- model baterije,
- proizvođača,
- battery category,
- osnovni capacity/power podatak,
- QR/passport ID,
- status compliancea na visokoj razini,
- osnovne safety i recycling upute,
- javni carbon footprint summary.

Ne može vidjeti:

- detaljne dobavljače,
- servisne zapise,
- raw telemetry,
- komercijalne podatke,
- security/audit informacije.

### 5.2 Asset Owner / Customer

**Opis:** Energetska kompanija, C&I kupac ili operator lokacije.  
**Cilj:** Upravljati assetom, pregledavati performanse, zdravlje, dokumente i izvještaje.

Može vidjeti:

- kompletan passport asseta koji posjeduje,
- health/performance dashboard,
- SoC/SoH trendove,
- cycle count,
- energy throughput,
- upozorenja,
- servisnu povijest,
- ESG izvještaje,
- downloadable compliance report.

### 5.3 Rimac Service Engineer

**Opis:** Rimac Energy stručnjak za servis i lifecycle podršku.  
**Cilj:** Dijagnosticirati health status, degradaciju, alarme i servisne događaje.

Može vidjeti:

- detaljniju telemetry,
- module-level health summary,
- thermal trendove,
- service tickets,
- warranty indicators,
- event logs,
- upload servisnih dokumenata.

Ne vidi:

- ENT interne platform credentials,
- podatke drugih kupaca osim dodijeljenih asseta.

### 5.4 ENT Platform Operator

**Opis:** Operator managed platforme.  
**Cilj:** Nadzirati dostupnost, ingest, sigurnost, audit i integracije.

Može vidjeti:

- platform health,
- ingest status,
- API status,
- audit trail,
- RBAC konfiguraciju,
- tenant konfiguraciju,
- data quality score.

Ne smije mijenjati Rimac-verified battery podatke osim kroz odobreni workflow.

### 5.5 Regulator / Market Surveillance Authority

**Opis:** Ovlaštena osoba koja provjerava usklađenost.  
**Cilj:** Vidjeti potrebne podatke, verifikacijski status i audit povijest.

Može vidjeti:

- compliance matrix,
- required passport attributes,
- verification status,
- EU declaration of conformity,
- selected safety/performance data,
- audit log relevantnih izmjena.

### 5.6 Recycler / Second-life Partner

**Opis:** Partner za rastavljanje, recikliranje ili second-life procjenu.  
**Cilj:** Procijeniti kemiju, materijale, sigurnost, rezidualnu vrijednost i handling instructions.

Može vidjeti:

- kemiju baterije,
- ključne materijale,
- safety handling instructions,
- disassembly documentation ako je odobreno,
- SoH i cycle history summary,
- end-of-life status.

---

## 6. MVP scope

MVP mora sadržavati sljedeće module:

1. **Asset Registry** — pregled SineStack asseta i njihovih lokacija.
2. **Digital Passport Page** — javna i privatna verzija passporta.
3. **QR Code Flow** — skeniranje QR koda vodi na javni passport.
4. **RBAC Login** — različite uloge vide različite podatke.
5. **Compliance Gap Analyzer** — status popunjenosti i verifikacije passport atributa.
6. **BMS/Telemetry Simulator** — mock ingest za SoC, SoH, temperaturu, cikluse i alarme.
7. **Lifecycle Timeline** — proizvodnja, commissioning, servis, incidenti, EoL.
8. **ESG & Carbon Module** — carbon footprint, recycled content, due diligence summary.
9. **Document Vault** — testni dokumenti, certifikati i izvještaji.
10. **Audit Trail** — sve promjene podataka i pristupa.
11. **Export Reports** — PDF/CSV/JSON export za demo.
12. **Claude Design UI Prototype** — moderno, atraktivno sučelje za stakeholder demo.

---

## 7. Funkcionalni zahtjevi

### FR-001 — Asset Registry

**Opis:** Sustav mora prikazivati listu baterijskih asseta s osnovnim statusima.  
**Prioritet:** Must have

#### Podaci u listi

- Asset ID
- Passport ID
- Model
- Lokacija
- Vlasnik asseta
- Kapacitet
- Power rating
- SoC
- SoH
- Compliance score
- Data quality score
- Alarm status
- Connectivity status
- Zadnji telemetry update

#### Acceptance criteria

- Korisnik može filtrirati assete po lokaciji, owneru, statusu i compliance scoreu.
- Klik na asset otvara detaljni passport view.
- Asseti s alarmima moraju biti vizualno istaknuti.
- Asseti s nepotpunim passport podacima moraju imati “Compliance gaps” badge.

---

### FR-002 — Digital Battery Passport Public View

**Opis:** Sustav mora imati javni passport prikaz dostupan bez prijave preko QR koda.  
**Prioritet:** Must have

#### Javni podaci

- Battery passport ID
- QR code / data carrier ID
- Manufacturer display name
- Battery model
- Battery category
- Serial number maskiran: npr. `SEST-2026-****-0001`
- Nominal energy capacity
- Power rating
- Chemistry: LFP
- Production year
- Country of assembly
- Safety summary
- Recycling instructions summary
- Public carbon footprint summary
- Compliance badge: Draft / In Review / Verified

#### Acceptance criteria

- Javna stranica ne smije prikazati osjetljive servisne, dobavljačke ili telemetry detalje.
- Stranica mora biti responzivna za mobilni uređaj, jer QR kod flow primarno kreće s mobitela.
- Javna stranica mora imati jasan “Request access” CTA.

---

### FR-003 — Private Passport View

**Opis:** Autorizirani korisnik mora vidjeti prošireni passport s punim lifecycle podacima prema ulozi.  
**Prioritet:** Must have

#### Sekcije passporta

1. Product identity
2. Manufacturer and responsible economic operator
3. Battery technical specification
4. Materials and chemistry
5. Carbon footprint
6. Recycled content
7. Performance and durability
8. State of Health and expected lifetime
9. Supply chain due diligence summary
10. Safety and handling
11. Repair, repurposing and disassembly notes
12. Documents
13. Audit history

#### Acceptance criteria

- Svaki atribut mora imati status: `missing`, `draft`, `provided`, `verified`, `expired`, `not_applicable`.
- Svaki atribut mora imati izvor podatka: `manual`, `BMS`, `ERP`, `MES`, `supplier_declaration`, `document_upload`, `calculated`, `simulated`.
- Svaki verified atribut mora imati verifier, timestamp i reference document.

---

### FR-004 — Compliance Gap Analyzer

**Opis:** Sustav mora izračunati compliance score na temelju popunjenosti i verifikacije atributa.  
**Prioritet:** Must have

#### Logika scorea za MVP

- Required attribute provided: +1 bod
- Required attribute verified: dodatnih +1 bod
- Expired required document: -2 boda
- Missing required attribute: 0 bodova
- Optional provided attribute: +0.25 bodova
- Data source quality weight:
  - verified document: 1.0
  - system integration: 0.9
  - manual entry: 0.6
  - simulated data: 0.3

#### Demo scoring

- 0–49%: Critical gaps
- 50–74%: Needs attention
- 75–89%: Nearly ready
- 90–100%: Passport ready

#### Acceptance criteria

- Dashboard mora prikazati top 5 missing/gap atributa.
- Korisnik može kliknuti gap i otvoriti task za unos/verifikaciju.
- Score mora biti jasno označen kao demo score, a ne službena regulatorna ocjena.

---

### FR-005 — BMS/Telemetry Simulator

**Opis:** Sustav mora simulirati BMS podatke za jedan ili više SineStack asseta.  
**Prioritet:** Must have

#### Telemetry podaci

- timestamp
- SoC %
- SoH %
- equivalent full cycles
- energy charged kWh
- energy discharged kWh
- average module temperature °C
- max module temperature °C
- min module temperature °C
- thermal gradient °C
- active alarms
- warning flags
- system availability %
- round-trip efficiency rolling estimate %
- connectivity status

#### Acceptance criteria

- Demo dataset mora sadržavati najmanje 90 dana hourly telemetry podataka za 3 asseta.
- Mora postojati “Generate new telemetry” opcija za demo.
- Sustav mora prikazati barem 4 chart prikaza: SoC, SoH, temperature, energy throughput.
- Sustav mora simulirati barem 3 alarm scenarija: high temperature warning, connectivity loss, capacity degradation warning.

---

### FR-006 — Lifecycle Timeline

**Opis:** Sustav mora prikazivati vremensku crtu životnog ciklusa baterije.  
**Prioritet:** Must have

#### Event types

- Design freeze
- Production batch created
- Module assembly
- Factory acceptance test
- Passport created
- Shipment
- Commissioning
- Firmware update
- Service inspection
- Alarm event
- Warranty review
- Repurposing assessment
- Recycling handover

#### Acceptance criteria

- Timeline mora jasno razlikovati production, operational, service i compliance događaje.
- Svaki event mora imati timestamp, actor, source i related document ako postoji.
- Events generirani iz BMS-a moraju biti označeni drugačije od ručno unesenih događaja.

---

### FR-007 — ESG & Carbon Module

**Opis:** Sustav mora prikazati demo ESG i carbon footprint podatke.  
**Prioritet:** Must have

#### Podaci

- Total product carbon footprint, kgCO2e
- Carbon intensity, kgCO2e/kWh
- Lifecycle stages:
  - raw materials
  - cell manufacturing
  - module assembly
  - system assembly
  - logistics
  - operation estimate
  - end-of-life estimate
- Recycled content:
  - aluminium
  - copper
  - steel
  - lithium
  - plastics
- Due diligence summary:
  - supplier declarations received
  - high-risk materials
  - open supplier actions
  - last review date

#### Acceptance criteria

- Korisnik može otvoriti carbon footprint breakdown po lifecycle stageu.
- Korisnik može vidjeti disclaimer: “Demo values — not externally verified.”
- ESG dashboard mora prikazivati i “confidence level” po podatku.

---

### FR-008 — Document Vault

**Opis:** Sustav mora imati repozitorij dokumenata vezanih uz asset, model i compliance.  
**Prioritet:** Must have

#### Tipovi dokumenata

- EU Declaration of Conformity — demo
- Safety Instructions — demo
- Transport & Handling Guide — demo
- Recycling Instructions — demo
- Carbon Footprint Statement — demo
- Supplier Due Diligence Summary — demo
- Factory Acceptance Test Report — demo
- Commissioning Report — demo
- Service Report — demo
- Firmware Release Notes — demo

#### Metadata

- document ID
- title
- type
- version
- owner
- uploaded by
- upload date
- valid from
- valid until
- verification status
- access level
- linked passport attributes

#### Acceptance criteria

- Korisnik može filtrirati dokumente po tipu i statusu.
- Expired dokumenti moraju biti označeni.
- Upload novog dokumenta mora generirati audit event.

---

### FR-009 — Role-based Access Control

**Opis:** Sustav mora demonstrirati razlike u pristupu prema ulozi.  
**Prioritet:** Must have

#### Uloge

- `PUBLIC_VIEWER`
- `ASSET_OWNER`
- `RIMAC_SERVICE_ENGINEER`
- `ENT_PLATFORM_OPERATOR`
- `REGULATOR`
- `RECYCLER`
- `ADMIN`

#### Acceptance criteria

- Korisnik može u demo modu promijeniti ulogu kroz “View as” dropdown.
- Svaka uloga mora imati drugačiji set vidljivih sekcija.
- Osjetljive sekcije moraju prikazivati “Restricted” state s objašnjenjem zašto nisu dostupne.

---

### FR-010 — Audit Trail

**Opis:** Sustav mora bilježiti sve izmjene, verifikacije, dokument uploadove i pristupe osjetljivim podacima.  
**Prioritet:** Must have

#### Event fields

- audit event ID
- timestamp
- actor
- actor role
- action
- entity type
- entity ID
- old value hash
- new value hash
- reason
- source IP / device label, demo
- verification reference

#### Acceptance criteria

- Audit trail mora biti pretraživ po assetu, korisniku i tipu akcije.
- Regulator view mora imati read-only audit trail.
- Admin može eksportirati audit trail u CSV.

---

### FR-011 — API Layer

**Opis:** Sustav mora imati demo API kontrakte za buduću integraciju s BMS, ERP, MES, SCADA i supplier portalima.  
**Prioritet:** Should have

#### API endpointi za MVP

```http
GET    /api/assets
GET    /api/assets/{assetId}
GET    /api/passports/{passportId}
PATCH  /api/passports/{passportId}/attributes/{attributeId}
POST   /api/telemetry/ingest
GET    /api/telemetry/{assetId}?from=&to=
GET    /api/compliance/{passportId}/score
POST   /api/documents
GET    /api/audit?assetId=&actor=&from=&to=
POST   /api/demo/seed
```

#### Acceptance criteria

- API response mora sadržavati `data`, `metadata`, `warnings` i `traceId`.
- Greške moraju koristiti strukturirani format s `code`, `message`, `field`, `severity`.
- API mora podržati demo auth token po ulozi.

---

### FR-012 — Notifications & Tasks

**Opis:** Sustav mora kreirati zadatke za missing data, expiring documents i operational alarms.  
**Prioritet:** Should have

#### Task types

- Missing required passport attribute
- Document expires in 30 days
- Telemetry ingest stopped
- High temperature warning
- SoH below threshold
- Supplier declaration missing
- Carbon footprint verification pending

#### Acceptance criteria

- Dashboard mora prikazati task count po prioritetu.
- Svaki task mora imati ownera, due date i status.
- Korisnik može označiti task kao resolved u demo modu.

---

### FR-013 — Export Reports

**Opis:** Sustav mora omogućiti export passport i compliance izvještaja.  
**Prioritet:** Should have

#### Formati

- JSON passport export
- PDF executive passport summary
- CSV audit trail
- CSV telemetry summary
- XLSX compliance gap table, optional

#### Acceptance criteria

- Export mora sadržavati timestamp i generated-by podatke.
- Export mora jasno označiti demo podatke.
- Export mora uključiti data confidence i verification status.

---

### FR-014 — Demo Data Seeder

**Opis:** Sustav mora imati ugrađen demo dataset i opciju resetiranja.  
**Prioritet:** Must have

#### Acceptance criteria

- Jedan klik resetira demo u početno stanje.
- Demo data mora sadržavati 3 asseta, 5 korisnika, 10 dokumenata, 90 dana telemetry i 40 audit događaja.
- Demo data mora uključivati barem jedan “nearly ready” asset, jedan “needs attention” asset i jedan “critical gaps” asset.

---

### FR-015 — Multilingual Support

**Opis:** MVP treba biti spreman za hrvatski i engleski UI.  
**Prioritet:** Could have

#### Acceptance criteria

- UI labels trebaju biti u translation map formatu.
- Default demo je na engleskom zbog međunarodnog stakeholder konteksta.
- Hrvatski copy treba biti spreman za ključne dashboard oznake.

---

## 8. Nefunkcionalni zahtjevi

### NFR-001 — Security

- Svi privatni prikazi moraju zahtijevati autentikaciju.
- RBAC mora biti centralno definiran.
- Svi audit eventi moraju biti append-only u demo logici.
- Osjetljivi podaci u UI-u moraju biti maskirani za neovlaštene uloge.
- Demo mora jasno razlikovati javne i privatne podatke.

### NFR-002 — Privacy & IP Protection

- Platforma ne smije prikazivati stvarne Rimac dobavljače, stvarne BOM podatke ili proprietary BMS algoritme.
- Testni podaci moraju biti označeni kao synthetic.
- Raw telemetry može biti agregirana za uloge bez servisnih privilegija.

### NFR-003 — Performance

- Asset list se mora učitati za manje od 2 sekunde u demo okruženju.
- Detaljni passport view mora se učitati za manje od 3 sekunde.
- Chartovi za 90 dana hourly telemetry moraju se renderirati bez vidljivog zastoja.

### NFR-004 — Reliability

- Demo mora imati fallback ako telemetry API nije dostupan.
- Zadnji poznati podaci moraju biti jasno označeni.
- Connectivity loss scenarij mora biti demonstrabilan.

### NFR-005 — Observability

- Platform health widget mora pokazivati ingest status, API status, DB status i export queue status.
- Svaki API response mora imati trace ID.
- Demo mora imati “System Status” panel za ENT platform operator ulogu.

### NFR-006 — Accessibility

- UI mora imati čitljiv kontrast.
- Svi statusi ne smiju ovisiti samo o boji; moraju imati tekstualne oznake.
- Tipkovnički fokus mora biti vidljiv.
- Komponente moraju biti čitljive na laptopu i tabletu.

### NFR-007 — Maintainability

- Data model mora biti modularan: asset, passport, attribute, document, telemetry, audit, task.
- UI komponente moraju biti ponovno upotrebljive.
- Demo dataset mora biti odvojen od logike aplikacije.

---

## 9. Predložena arhitektura pilota

### 9.1 Logical architecture

```text
[QR Code / Browser]
        |
        v
[Public Passport Web App]
        |
        v
[Auth + RBAC] ---- [Role Switch Demo Mode]
        |
        v
[Private Passport & Lifecycle Portal]
        |
        +--> [Asset Registry]
        +--> [Compliance Engine]
        +--> [Telemetry Dashboard]
        +--> [Document Vault]
        +--> [Audit Trail]
        +--> [Export Service]
        |
        v
[API Gateway]
        |
        +--> [Mock BMS Telemetry Service]
        +--> [Mock ERP/MES Data Service]
        +--> [Mock Supplier Portal]
        +--> [Mock Document Storage]
```

### 9.2 Future-state integrations

U stvarnom proizvodu, mock servisi bi se zamijenili integracijama:

- Rimac Energy BMS / Battery Intelligence platforma
- Rimac MES / production traceability
- ERP master data
- supplier declaration portal
- SCADA / EMS / site controller
- document management system
- identity provider
- regulator / notified body workflow
- recycler portal

---

## 10. Data model — konceptualni entiteti

### 10.1 Asset

```json
{
  "assetId": "ASSET-SEST-ZG-0001",
  "passportId": "BP-HR-RE-SEST-2026-0001",
  "model": "SineStack SE-868-2H",
  "serialNumber": "SEST-2026-04-ZG-0001",
  "owner": "Adria Grid Storage d.o.o. - Demo",
  "operator": "Rimac Energy Demo Operations",
  "location": {
    "siteName": "Rimac Campus Energy Lab - Demo",
    "city": "Sveta Nedelja",
    "country": "Croatia",
    "lat": 45.7951,
    "lng": 15.7803
  },
  "nominalEnergyKWh": 868,
  "usableEnergyKWh": 790,
  "ratedPowerKVA": 400,
  "outputVoltage": "400 Vac 3-phase",
  "chemistry": "LFP",
  "commissioningDate": "2026-03-18",
  "status": "Operational",
  "complianceStatus": "Nearly ready",
  "connectivityStatus": "Online"
}
```

### 10.2 Passport Attribute

```json
{
  "attributeId": "ATTR-CARBON-001",
  "passportId": "BP-HR-RE-SEST-2026-0001",
  "section": "Carbon Footprint",
  "name": "Product carbon footprint per functional unit",
  "value": 65.2,
  "unit": "kgCO2e/kWh",
  "status": "provided",
  "verificationStatus": "pending_external_verification",
  "source": "simulated_lca_model",
  "confidence": "medium",
  "accessLevel": "REGULATOR_AND_ASSET_OWNER",
  "lastUpdated": "2026-06-15T10:42:00Z"
}
```

### 10.3 Telemetry Reading

```json
{
  "assetId": "ASSET-SEST-ZG-0001",
  "timestamp": "2026-06-24T12:00:00Z",
  "socPct": 67.4,
  "sohPct": 99.1,
  "equivalentFullCycles": 143,
  "energyChargedKWhToday": 426.2,
  "energyDischargedKWhToday": 389.7,
  "avgModuleTempC": 27.8,
  "maxModuleTempC": 30.1,
  "minModuleTempC": 26.9,
  "thermalGradientC": 3.2,
  "rollingRoundTripEfficiencyPct": 92.3,
  "availabilityPct30d": 99.82,
  "activeAlarms": [],
  "connectivityStatus": "Online"
}
```

### 10.4 Document

```json
{
  "documentId": "DOC-SEST-0007",
  "assetId": "ASSET-SEST-ZG-0001",
  "title": "Factory Acceptance Test Report - Demo",
  "type": "FACTORY_ACCEPTANCE_TEST",
  "version": "1.2-demo",
  "status": "verified",
  "accessLevel": "ASSET_OWNER_AND_REGULATOR",
  "uploadedBy": "rimac.service.demo@rimac.local",
  "uploadedAt": "2026-03-12T09:15:00Z",
  "validUntil": "2027-03-12",
  "linkedAttributes": ["ATTR-PERF-001", "ATTR-SAFETY-004"]
}
```

### 10.5 Audit Event

```json
{
  "auditEventId": "AUD-20260624-00031",
  "timestamp": "2026-06-24T12:08:11Z",
  "actor": "elena.operator@ent-demo.local",
  "actorRole": "ENT_PLATFORM_OPERATOR",
  "action": "ATTRIBUTE_STATUS_CHANGED",
  "entityType": "PASSPORT_ATTRIBUTE",
  "entityId": "ATTR-CARBON-001",
  "oldValueHash": "sha256:demo-old-92b1",
  "newValueHash": "sha256:demo-new-f41a",
  "reason": "Marked as pending external verification after LCA document upload",
  "traceId": "trc_demo_01933"
}
```

---

## 11. Demo dataset

### 11.1 Demo organizations

| Organization ID | Name | Type | Country | Notes |
|---|---|---|---|---|
| ORG-RIMAC-DEMO | Rimac Energy Demo Operations | Manufacturer / service | Croatia | Synthetic demo entity |
| ORG-ENT-DEMO | Ericsson Nikola Tesla Platform Ops | Platform operator | Croatia | Synthetic demo entity |
| ORG-ADRIA-GRID | Adria Grid Storage d.o.o. | Asset owner | Croatia | Synthetic C&I/utility buyer |
| ORG-NORTHSEA-ENERGY | NorthSea Flex Storage Ltd. | Asset owner | United Kingdom | Synthetic customer |
| ORG-EU-MSA-DEMO | EU Market Surveillance Demo Authority | Regulator | EU | Synthetic regulator role |
| ORG-CIRCULAR-BAT | Circular Battery Recovery GmbH | Recycler | Germany | Synthetic recycler |

### 11.2 Demo users

| User | Email | Role | Organization |
|---|---|---|---|
| Public QR User | none | PUBLIC_VIEWER | none |
| Maja Kovač | maja.kovac@adriagrid.demo | ASSET_OWNER | Adria Grid Storage |
| Ivan Horvat | ivan.horvat@rimac-energy.demo | RIMAC_SERVICE_ENGINEER | Rimac Energy Demo Operations |
| Elena Marković | elena.markovic@ent-demo.local | ENT_PLATFORM_OPERATOR | Ericsson Nikola Tesla Platform Ops |
| Sofia Weber | sofia.weber@msa-demo.eu | REGULATOR | EU Market Surveillance Demo Authority |
| Lukas Schneider | lukas.schneider@circularbat.demo | RECYCLER | Circular Battery Recovery GmbH |
| Admin Demo | admin@battery-passport.demo | ADMIN | Pilot Admin |

### 11.3 Demo assets

#### Asset 1 — Nearly ready

```yaml
assetId: ASSET-SEST-ZG-0001
passportId: BP-HR-RE-SEST-2026-0001
model: SineStack SE-868-2H
serialNumber: SEST-2026-04-ZG-0001
owner: Adria Grid Storage d.o.o. - Demo
site: Rimac Campus Energy Lab - Demo
city: Sveta Nedelja
country: Croatia
nominalEnergyKWh: 868
usableEnergyKWh: 790
ratedPowerKVA: 400
chemistry: LFP
commissioningDate: 2026-03-18
socPct: 67.4
sohPct: 99.1
cycles: 143
rollingRtePct: 92.3
availability30dPct: 99.82
complianceScorePct: 87
dataQualityScorePct: 81
status: Operational
alarmStatus: Normal
connectivity: Online
```

#### Asset 2 — Needs attention

```yaml
assetId: ASSET-SEST-UK-0002
passportId: BP-UK-RE-SEST-2026-0002
model: SineStack SE-868-2H
serialNumber: SEST-2026-05-UK-0002
owner: NorthSea Flex Storage Ltd. - Demo
site: Colchester Flex Storage Demo Site
city: Colchester
country: United Kingdom
nominalEnergyKWh: 868
usableEnergyKWh: 790
ratedPowerKVA: 400
chemistry: LFP
commissioningDate: 2026-05-07
socPct: 42.8
sohPct: 99.6
cycles: 58
rollingRtePct: 91.7
availability30dPct: 98.94
complianceScorePct: 72
dataQualityScorePct: 68
status: Operational
alarmStatus: Warning
connectivity: Online
activeWarning: Supplier due diligence declaration missing for graphite source demo record
```

#### Asset 3 — Critical gaps

```yaml
assetId: ASSET-SEST-HR-0003
passportId: BP-HR-RE-SEST-2026-0003
model: SineStack SE-868-2H
serialNumber: SEST-2026-06-HR-0003
owner: Adria Grid Storage d.o.o. - Demo
site: Dalmatia Solar + Storage Demo
city: Zadar
country: Croatia
nominalEnergyKWh: 868
usableEnergyKWh: 790
ratedPowerKVA: 400
chemistry: LFP
commissioningDate: planned 2026-07-15
socPct: null
sohPct: null
cycles: 0
rollingRtePct: null
availability30dPct: null
complianceScorePct: 43
dataQualityScorePct: 52
status: Pre-commissioning
alarmStatus: None
connectivity: Pending
activeWarning: Passport missing carbon footprint statement and recycling instructions
```

### 11.4 Passport attributes — sample set

| Attribute ID | Section | Attribute | Asset 1 Value | Status | Source | Confidence |
|---|---|---|---|---|---|---|
| ATTR-ID-001 | Identity | Passport ID | BP-HR-RE-SEST-2026-0001 | verified | platform | high |
| ATTR-ID-002 | Identity | Battery model | SineStack SE-868-2H | verified | manufacturer master data | high |
| ATTR-ID-003 | Identity | Serial number | SEST-2026-04-ZG-0001 | verified | production mock | high |
| ATTR-TECH-001 | Technical | Nominal energy capacity | 868 kWh | provided | public spec + demo | medium |
| ATTR-TECH-002 | Technical | Usable energy | 790 kWh | provided | public spec + demo | medium |
| ATTR-TECH-003 | Technical | Rated power | 400 kVA | provided | public spec + demo | medium |
| ATTR-TECH-004 | Technical | Output voltage | 400 Vac 3-phase | provided | public spec + demo | medium |
| ATTR-CHEM-001 | Chemistry | Battery chemistry | LFP | provided | manufacturer declaration demo | medium |
| ATTR-CHEM-002 | Chemistry | Critical raw materials | lithium, graphite, copper, aluminium | draft | supplier declaration demo | medium |
| ATTR-CARBON-001 | Carbon | Carbon intensity | 65.2 kgCO2e/kWh | provided | simulated LCA | medium |
| ATTR-CARBON-002 | Carbon | Total product footprint | 56,594 kgCO2e | calculated | simulated LCA | medium |
| ATTR-REC-001 | Recycled content | Aluminium recycled content | 28% | draft | supplier declaration demo | low |
| ATTR-REC-002 | Recycled content | Copper recycled content | 19% | draft | supplier declaration demo | low |
| ATTR-REC-003 | Recycled content | Steel recycled content | 37% | draft | supplier declaration demo | low |
| ATTR-PERF-001 | Performance | Round-trip efficiency | 92.3% rolling estimate | provided | BMS simulator | medium |
| ATTR-PERF-002 | Performance | Cycle lifetime design target | 12,000 cycles | provided | public spec + demo | medium |
| ATTR-SOH-001 | State of Health | Current SoH | 99.1% | provided | BMS simulator | medium |
| ATTR-SOH-002 | State of Health | Equivalent full cycles | 143 | provided | BMS simulator | medium |
| ATTR-SAFETY-001 | Safety | Safety instructions | Document linked | verified | document vault | high |
| ATTR-EOL-001 | EoL | Recycling instructions | Document linked | draft | document vault | medium |
| ATTR-DUE-001 | Due diligence | Supplier declarations received | 8 of 10 | draft | supplier portal mock | medium |
| ATTR-DOC-001 | Compliance | EU Declaration of Conformity | Document linked | draft | document vault | medium |

### 11.5 Carbon footprint demo breakdown

```yaml
totalProductCarbonFootprintKgCO2e: 56594
carbonIntensityKgCO2ePerKWh: 65.2
lifecycleBreakdown:
  rawMaterials: 38.5%
  cellManufacturing: 31.0%
  moduleAssembly: 8.0%
  systemAssembly: 7.5%
  powerElectronicsAndCooling: 9.0%
  logistics: 3.0%
  endOfLifeProcessingEstimate: 3.0%
verificationStatus: Demo estimate - not externally verified
confidence: Medium
```

### 11.6 Recycled content demo data

| Material | Recycled content | Source | Status |
|---|---:|---|---|
| Aluminium | 28% | Supplier declaration demo | Draft |
| Copper | 19% | Supplier declaration demo | Draft |
| Steel | 37% | Supplier declaration demo | Draft |
| Lithium | 6.1% | Supplier declaration demo | Pending verification |
| Plastics | 14% | Supplier declaration demo | Draft |
| Cobalt | N/A | LFP chemistry demo | Not applicable |
| Nickel | N/A | LFP chemistry demo | Not applicable |

### 11.7 Telemetry seed rules

Generate 90 days hourly data for each operational asset.

#### Normal profile

- SoC cycles between 20% and 90%.
- SoH decreases slowly from 99.4% to 99.1% over 90 days.
- Average temperature between 22°C and 32°C.
- Thermal gradient typically 2°C–4°C.
- Round-trip efficiency between 91.7% and 92.6%.
- Availability above 99.5%.

#### Warning profile

- One day with temperature gradient above 5°C.
- One 90-minute connectivity loss.
- One supplier/compliance task unrelated to operations.
- No critical battery failure.

#### Pre-commissioning profile

- No live telemetry.
- Factory test values available.
- Connectivity pending.
- Commissioning checklist incomplete.

---

## 12. Dashboard KPI-jevi

### Executive KPI cards

1. Total assets: 3
2. Operational assets: 2
3. Passport readiness average: 67%
4. Critical gaps: 6
5. Open compliance tasks: 11
6. Average SoH operational assets: 99.35%
7. Energy discharged last 30 days: 48.2 MWh
8. Platform ingest uptime: 99.91%
9. Documents pending verification: 7
10. Estimated avoided reporting effort: 42 hours / asset / year, demo assumption

### Asset health KPI-jevi

- SoH
- SoC
- Cycle count
- Energy throughput
- Availability
- Thermal stability
- Active alarms
- Warranty risk indicator

### Compliance KPI-jevi

- Required attributes completed
- Required attributes verified
- Missing attributes
- Expiring documents
- Supplier declarations pending
- Public data completeness
- Regulator data readiness
- Recycler data readiness

---

## 13. User journeys

### Journey 1 — QR scan by public viewer

1. Korisnik skenira QR kod na SineStack demo assetu.
2. Otvara se javni passport page.
3. Korisnik vidi osnovne podatke, safety summary i public compliance badge.
4. Korisnik klikne “Request extended access”.
5. Sustav prikazuje formu za zahtjev za pristup.

### Journey 2 — Asset owner provjerava health i compliance

1. Asset owner se prijavljuje.
2. Dashboard prikazuje 3 asseta i njihove statuse.
3. Asset owner otvara Asset 2 s warning statusom.
4. Vidi da compliance score iznosi 72%.
5. Otvara Compliance gaps.
6. Vidi da nedostaje supplier due diligence declaration za demo graphite source.
7. Kreira task za Rimac service / supplier ops.
8. Exporta compliance summary report.

### Journey 3 — Regulator pregledava passport

1. Regulator se prijavljuje kroz demo role switch.
2. Otvara Passport BP-HR-RE-SEST-2026-0001.
3. Vidi required attributes, verification status i dokumente.
4. Otvara audit trail za carbon footprint atribut.
5. Vidi da je vrijednost demo-estimate i nije externally verified.
6. Označava review note: “External LCA verification required before production use.”

### Journey 4 — Rimac service engineer analizira alarm

1. Service engineer otvara telemetry dashboard.
2. Vidi high temperature warning na Asset 2.
3. Otvara temperature chart i module-level summary.
4. Vidi da je thermal gradient bio 5.7°C na 2026-06-12.
5. Otvara service ticket.
6. Uploadira demo service report.
7. Sustav automatski kreira audit event i ažurira lifecycle timeline.

### Journey 5 — ENT platform operator provjerava ingest

1. Platform operator otvara System Status.
2. Vidi da je telemetry ingest za Asset 2 imao 90-minute connectivity loss.
3. Otvara trace detalje i API health.
4. Vidi da je sustav koristio last-known-good snapshot.
5. Kreira internal ops note.

---

## 14. UI routes / screen map

```text
/
  Landing / product intro
/public/passport/:passportId
  Public QR passport view
/login
  Demo login / role switch
/dashboard
  Executive overview
/assets
  Asset registry list
/assets/:assetId
  Asset detail overview
/assets/:assetId/passport
  Private battery passport
/assets/:assetId/telemetry
  BMS telemetry dashboard
/assets/:assetId/timeline
  Lifecycle timeline
/compliance
  Compliance gap analyzer
/documents
  Document vault
/audit
  Audit trail
/tasks
  Compliance and operations tasks
/system
  ENT platform operations status
/admin/demo-data
  Demo reset and seed controls
```

---

## 15. UI/UX requirements

### 15.1 Visual positioning

Sučelje treba izgledati kao premium B2B energy-tech platforma: ozbiljno, moderno, pouzdano i vizualno atraktivno. Ne smije izgledati kao generički enterprise admin panel.

Ključni dojam:

- clean energy,
- high-tech,
- secure infrastructure,
- premium Croatian engineering,
- board-level demo ready.

### 15.2 Visual language

- Tamna tema kao default: deep navy / near black background.
- Electric cyan i emerald akcenti za energiju, connectivity i health.
- Amber/orange za warnings.
- Red samo za critical alerts.
- Koristiti “glassmorphism” oprezno za hero cards, ne pretjerati.
- Koristiti fine grid linije ili subtle circuit/battery pattern u pozadini.
- Kartice moraju imati puno whitespacea.
- KPI cards moraju imati velike brojke i mikro-labels.
- Statusi moraju koristiti badge + tekst, ne samo boju.

### 15.3 Typography

- Primarni font: Inter, Geist, SF Pro ili sličan.
- Numerički podaci: tabular numbers.
- Naslovi: semi-bold, jasna hijerarhija.
- Tehnički identifikatori: mono font.

### 15.4 Navigation

- Lijevi sidebar za desktop.
- Top bar s aktivnom ulogom, tenantom i demo mode indikatorom.
- Breadcrumbs na detaljnim stranicama.
- Mobile layout mora koristiti bottom nav ili compact drawer.

### 15.5 Components

Obvezne komponente:

- `AssetStatusCard`
- `PassportReadinessGauge`
- `BatteryHealthCard`
- `TelemetryChart`
- `ComplianceGapTable`
- `PassportAttributeRow`
- `QRCodePanel`
- `LifecycleTimeline`
- `DocumentVaultTable`
- `AuditTrailTimeline`
- `RoleAccessBanner`
- `RestrictedDataPlaceholder`
- `CarbonFootprintBreakdown`
- `RecycledContentBarList`
- `SystemHealthPanel`
- `DemoDataControlPanel`

### 15.6 Microcopy

Primjeri kratkih tekstova:

- “Passport readiness is a demo score based on attribute completeness and verification state.”
- “This value is simulated and not externally verified.”
- “Restricted: available to asset owner, regulator or authorized service engineer.”
- “Last telemetry update: 4 minutes ago.”
- “Data quality improved after document verification.”
- “QR public view contains only non-sensitive passport information.”

---

## 16. Claude Design instructions

### 16.1 Kratka uputa za Claude Design

Koristi ovu uputu kada želiš da Claude napravi vizualno atraktivan prototip.

```text
Design a modern, premium B2B SaaS web app for a Digital Battery Passport & Lifecycle Data Platform pilot by Ericsson Nikola Tesla and Rimac Energy. The app demonstrates an EU Battery Passport for Rimac Energy SineStack BESS assets using synthetic but realistic data.

The visual style should be high-end energy-tech: dark navy background, electric cyan and emerald accents, clean glass cards, precise data visualization, subtle grid/circuit patterns, excellent whitespace, and a professional board-level demo feel. Avoid generic enterprise dashboards.

Build these screens:
1. Executive dashboard with asset overview, passport readiness, compliance gaps, average SoH, energy throughput, open tasks, and platform ingest status.
2. Asset registry with 3 SineStack assets and filters.
3. Private battery passport detail page with sections for identity, technical specs, chemistry, carbon footprint, recycled content, performance, SoH, due diligence, documents, and audit status.
4. Public QR passport page optimized for mobile, showing only non-sensitive passport data.
5. Telemetry dashboard with SoC, SoH, temperature, round-trip efficiency, cycle count and alarms.
6. Compliance gap analyzer with required attributes, status badges, confidence levels and tasks.
7. Lifecycle timeline showing production, commissioning, firmware update, service event and compliance events.
8. Document vault with certificates, safety docs, recycling instructions and verification states.
9. Audit trail page for regulator/platform operator review.
10. System status page for ENT platform operator showing API, telemetry ingest, database, export queue and role access status.

Use synthetic demo data. Main assets:
- ASSET-SEST-ZG-0001, Passport BP-HR-RE-SEST-2026-0001, SineStack SE-868-2H, Sveta Nedelja, Croatia, 868 kWh nominal, 790 kWh usable, 400 kVA, LFP, SoC 67.4%, SoH 99.1%, 143 cycles, 92.3% rolling round-trip efficiency, compliance score 87%, status Nearly ready.
- ASSET-SEST-UK-0002, Passport BP-UK-RE-SEST-2026-0002, Colchester, UK, SoC 42.8%, SoH 99.6%, 58 cycles, 91.7% efficiency, compliance score 72%, status Needs attention, warning: supplier due diligence declaration missing.
- ASSET-SEST-HR-0003, Passport BP-HR-RE-SEST-2026-0003, Zadar, Croatia, pre-commissioning, compliance score 43%, critical gaps: carbon footprint statement and recycling instructions missing.

Important UX rules:
- Always show that data is synthetic/demo where relevant.
- Show role-based access with a “View as” role switcher: Public Viewer, Asset Owner, Rimac Service Engineer, ENT Platform Operator, Regulator, Recycler, Admin.
- Public view must be mobile-first and must hide sensitive data.
- Use badges for Missing, Draft, Provided, Verified, Expired, Not applicable.
- Use a clear compliance readiness gauge.
- Use line charts for telemetry and bar/donut visualizations for carbon footprint and recycled content.
- Make the product look credible enough for a strategic partnership presentation.

Suggested tech stack for prototype: React + TypeScript + Tailwind CSS + shadcn/ui + lucide-react + Recharts. Use mock JSON data in the frontend. No backend required for first design prototype.
```

### 16.2 Detaljna uputa za Claude Code / Claude Artifacts

```text
Create a React + TypeScript single-page application prototype for a Digital Battery Passport & Lifecycle Data Platform pilot.

Project name: battery-passport-pilot
Design language: premium dark energy-tech dashboard, suitable for Ericsson Nikola Tesla + Rimac Energy strategic partnership demo.

Use:
- React
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- lucide-react icons
- Recharts for charts
- local mock data only

No backend is required. Put all demo data in /src/data/demoData.ts.

Required pages/components:

1. App Shell
- Left sidebar navigation
- Top bar with project name, active role, tenant, demo mode badge
- “View as role” dropdown
- Responsive behavior

2. Dashboard Page
- Hero title: “Connected Battery Passport Platform”
- Subtitle: “EU Battery Passport, lifecycle traceability and BESS operations intelligence — demo environment”
- KPI cards:
  - Total assets: 3
  - Operational assets: 2
  - Average passport readiness: 67%
  - Critical gaps: 6
  - Open tasks: 11
  - Average SoH: 99.35%
  - 30-day discharged energy: 48.2 MWh
  - Platform ingest uptime: 99.91%
- Asset status cards for three SineStack assets
- Passport readiness gauge
- Compliance gaps preview
- Telemetry health mini chart

3. Asset Registry Page
- Filterable/searchable table
- Columns: Asset ID, Passport ID, Site, Country, Owner, SoC, SoH, Compliance, Connectivity, Alarm, Last update
- Use colored badges with text

4. Passport Detail Page
- Header with asset name, passport ID, QR code placeholder, readiness score
- Tabs or sections:
  - Identity
  - Technical specs
  - Chemistry & materials
  - Carbon footprint
  - Recycled content
  - Performance & durability
  - State of Health
  - Documents
  - Audit
- Each passport attribute row shows value, unit, status badge, source, confidence, last updated.

5. Public QR Passport Page
- Mobile-first card layout
- Shows only public data:
  - passport ID
  - model
  - manufacturer
  - battery category
  - capacity
  - chemistry
  - production year
  - public safety summary
  - recycling summary
  - public compliance badge
- Add “Request extended access” CTA
- Show “Sensitive lifecycle data hidden” notice

6. Telemetry Page
- Charts:
  - SoC over time
  - SoH over time
  - Temperature range over time
  - Energy charged/discharged
  - Rolling round-trip efficiency
- Alarm timeline
- Current status card

7. Compliance Page
- Compliance readiness gauge
- Table of required attributes
- Filters by Missing, Draft, Provided, Verified, Expired
- Top 5 gaps panel
- Task creation mock button

8. Lifecycle Timeline Page
- Vertical timeline with events:
  - Design freeze
  - Production batch created
  - Factory acceptance test
  - Passport created
  - Shipment
  - Commissioning
  - Firmware update
  - Service inspection
  - High temperature warning
  - Carbon footprint document uploaded
- Each event has actor, timestamp, source and document link placeholder.

9. Document Vault Page
- Table/grid of demo documents
- Status: Verified, Draft, Pending verification, Expired
- Access level chips
- Upload document mock button

10. Audit Trail Page
- Timeline/table of audit events
- Search/filter by actor, action, entity, date
- Read-only regulator style

11. System Status Page
- ENT platform operator focused view
- API status, telemetry ingest, database, export queue, auth service
- trace IDs and last sync times
- connectivity map/list for 3 assets

Demo data must include:
- 3 assets as defined in requirements
- 90-day generated telemetry arrays for operational assets
- passport attribute list
- document list
- audit event list
- task list
- role access rules

Interaction requirements:
- Role switcher changes visible sections and restricted placeholders.
- Clicking an asset opens detail state/page.
- Compliance filters work locally.
- Demo reset button restores initial data.
- No real network calls.

Important copy:
- “Synthetic demo data — not externally verified.”
- “Passport readiness is a demo score based on attribute completeness and verification state.”
- “Public QR view contains only non-sensitive battery passport information.”
- “Restricted data: available only to authorized roles.”

Make the UI polished and impressive. Use high-quality spacing, icons, cards, gradients, charts and badges. The prototype should look like a real strategic partnership demo, not a wireframe.
```

---

## 17. Acceptance criteria za cijeli pilot

Pilot se smatra uspješnim ako:

1. Stakeholder može kroz 10-minutni demo razumjeti vrijednost platforme.
2. QR public passport flow radi bez prijave.
3. Private passport view demonstrira role-based data access.
4. Dashboard jasno prikazuje health, compliance i ESG sliku za 3 asseta.
5. Compliance gap analyzer pokazuje koje podatke treba dopuniti ili verificirati.
6. Telemetry simulator uvjerljivo prikazuje BMS/lifecycle poveznicu.
7. Audit trail pokazuje povjerenje, traceability i regulatornu spremnost.
8. UI izgleda moderno, premium i dovoljno atraktivno za strateški sastanak.
9. Svi testni podaci su jasno označeni kao sintetički.
10. Pilot jasno pokazuje što bi Rimac Energy i Ericsson Nikola Tesla svaki donijeli u partnerstvo.

---

## 18. Predloženi plan izvedbe 12–16 tjedana

### Faza 1 — Discovery i data model, 2 tjedna

- Uskladiti MVP scope.
- Definirati passport attribute subset.
- Definirati role matrix.
- Finalizirati demo dataset.
- Izraditi UX wireframe.

### Faza 2 — UI prototype, 2–3 tjedna

- Dashboard.
- Asset registry.
- Passport detail.
- Public QR view.
- Role switcher.
- Initial demo data.

### Faza 3 — Compliance i telemetry, 3–4 tjedna

- Compliance score logic.
- Gap analyzer.
- Telemetry generator.
- Chartovi.
- Lifecycle timeline.

### Faza 4 — Documents, audit i export, 2–3 tjedna

- Document vault.
- Audit trail.
- Report export.
- System status page.

### Faza 5 — Demo hardening, 2–4 tjedna

- Polish UI.
- Demo storyline.
- Security disclaimers.
- Performance optimizacija.
- Stakeholder dry-run.
- Final MVP package.

---

## 19. Demo storyline za prezentaciju

### Opening

“EU Battery Passport postaje obvezan za industrijske baterije iznad 2 kWh. Rimac Energy ima napredan BESS proizvod i baterijske podatke, a Ericsson Nikola Tesla može dati sigurnu digitalnu platformu, connectivity, lifecycle traceability i managed operations sloj.”

### Scene 1 — Executive dashboard

Pokazati 3 asseta, readiness score i health. Naglasiti da platforma spaja compliance, operations i ESG.

### Scene 2 — QR public passport

Pokazati kako netko na lokaciji skenira QR i vidi samo javne podatke.

### Scene 3 — Private passport

Prebaciti se na Asset Owner view i otvoriti detaljni passport. Naglasiti role-based data access.

### Scene 4 — Compliance gap

Pokazati da Asset 2 ima 72% readiness i missing supplier declaration. Naglasiti vrijednost za pripremu regulatorne usklađenosti.

### Scene 5 — Telemetry + lifecycle

Pokazati SoH/SoC/temperature trend i lifecycle event. Naglasiti da passport nije statični PDF, nego živi digitalni asset record.

### Scene 6 — Audit + regulator

Prebaciti se na regulator role i pokazati audit trail i verification status.

### Closing

“Ovaj pilot pokazuje kako hrvatski high-tech partneri mogu ponuditi europsku referentnu arhitekturu za secure, connected and AI-ready battery lifecycle infrastructure.”

---

## 20. Rizici i mitigacije

| Rizik | Utjecaj | Mitigacija |
|---|---|---|
| EU provedbeni detalji se mijenjaju | Srednji/visok | Graditi modularni attribute registry i versioning |
| Previše regulatornih atributa za MVP | Srednji | Fokusirati se na reprezentativni subset |
| Osjetljivi Rimac IP | Visok | Koristiti sintetičke podatke, role-based masking, agregaciju |
| Nema stvarne BMS integracije | Nizak za pilot | Koristiti simulator s realističnim trendovima |
| UI izgleda previše kao admin panel | Srednji | Koristiti premium energy-tech design direction |
| Stakeholderi očekuju pravno certificiran proizvod | Srednji | Jasni disclaimers: demo/MVP, not legal certification |
| Data quality iz supply chaina | Visok u stvarnom proizvodu | Uvesti confidence score, source tracking i verification workflow |

---

## 21. Buduća proširenja nakon pilota

1. Stvarna BMS/Battery Intelligence integracija.
2. Integracija s Rimac MES/ERP proizvodnim podacima.
3. Supplier declaration portal.
4. Digital signatures i verifiable credentials.
5. Notified body / regulator workflow.
6. Advanced battery analytics i predictive maintenance.
7. Second-life valuation model.
8. Recycler data exchange.
9. Multi-tenant SaaS za druge battery OEM-e.
10. Private 5G / edge deployment za industrijske lokacije.
11. AI copilot za compliance gaps i lifecycle questions.
12. Automated report generation za kupce i financijere.

---

## 22. Predložena struktura repozitorija za prototip

```text
battery-passport-pilot/
  README.md
  requirements.md
  package.json
  src/
    App.tsx
    main.tsx
    data/
      demoData.ts
      telemetryGenerator.ts
      roleMatrix.ts
    components/
      AppShell.tsx
      AssetStatusCard.tsx
      PassportReadinessGauge.tsx
      BatteryHealthCard.tsx
      TelemetryChart.tsx
      ComplianceGapTable.tsx
      PassportAttributeRow.tsx
      QRCodePanel.tsx
      LifecycleTimeline.tsx
      DocumentVaultTable.tsx
      AuditTrailTimeline.tsx
      RoleAccessBanner.tsx
      RestrictedDataPlaceholder.tsx
      CarbonFootprintBreakdown.tsx
      RecycledContentBarList.tsx
      SystemHealthPanel.tsx
    pages/
      DashboardPage.tsx
      AssetRegistryPage.tsx
      PassportDetailPage.tsx
      PublicPassportPage.tsx
      TelemetryPage.tsx
      CompliancePage.tsx
      LifecycleTimelinePage.tsx
      DocumentVaultPage.tsx
      AuditTrailPage.tsx
      SystemStatusPage.tsx
      DemoDataAdminPage.tsx
    utils/
      complianceScore.ts
      formatters.ts
      accessControl.ts
      mockApi.ts
```

---

## 23. Definition of done

MVP je gotov kada:

- `requirements.md` je usklađen i odobren za pilot.
- Prototip ima sve ključne stranice.
- Demo dataset je dovoljno bogat za 10–15 minuta prezentacije.
- Role switcher demonstrira različite poglede.
- Compliance gap analyzer radi s testnim podacima.
- Telemetry chartovi rade lokalno.
- QR public view je mobile-first.
- Dokumenti, audit trail i lifecycle timeline su povezani s assetima.
- UI je dovoljno vizualno ispoliran za prezentaciju potencijalnim partnerima.
- Svi osjetljivi ili regulatorni dijelovi imaju jasne demo disclaimere.

---

## 24. Jednorečeni pitch

**Ericsson Nikola Tesla i Rimac Energy mogu zajednički demonstrirati secure, connected i compliance-ready digital battery passport platformu koja baterijski sustav pretvara iz fizičkog proizvoda u auditabilan, operativno nadziran i tržišno diferenciran digitalni asset.**
