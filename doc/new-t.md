
  There are three realistic ways to make our output match
  these references. This is the fork I need your call on
  before building:

  - Full HTML/CSS rebuild (recommended) — recreate each
  bill's exact layout in HTML/CSS with {{placeholders}},
  matching fonts, the EDF logo, the water-board logo,
  table borders, colors. Fully searchable text, easy to
  edit later, fits the pipeline perfectly. Most upfront
  effort but the "correct" long-term answer, and it's
  what the current system already tries to do.
  - Background image + text overlay — clean the dummy
  data off a reference, use the bill as a full-page
  background image, and position only the dynamic fields
  (name, amounts, dates) on top. Fastest route to a
  pixel-perfect look, but the static text (labels,
  boilerplate) becomes a non-searchable image, and it
  needs a blank background which these PDFs don't give us
  cleanly (the EDF has dummy text baked in; the Nicosia
  has stamps).
  - Refine current templates — keep our existing HTML and
  just correct where it drifts from these references.
  Least work, but it will never be truly "exact."

  Proposed workflow (assuming the recommended rebuild 
  path)

  Phase 0 — Extract the source of truth. Render each
  reference PDF to high-res images per page. For Nicosia,
  isolate page 1 (Greek layout) + page 3 (English
  labels) and discard page 2 and all stamps. These images
  become the pixel target we build against.

  Phase 1 — Field inventory. For each bill, list every
  piece of text and mark it static (labels, logos,
  boilerplate, table headers) vs dynamic (fills from the
  form). This is where the real design work is, because
  these references expose fields our current data model
  doesn't have yet (see next section).

  Phase 2 — Reconcile the data model. Update the form +
  payload shape + validators to cover the new dynamic
  fields. Right now our payload has customer, billing,
  financials, meter, plus edfSpecific/nicosiaSpecific.
  These references need additions (below).

  Phase 3 — Build the HTML templates. Recreate each
  layout in HTML/CSS with Handlebars placeholders,
  overlaying the reference image during development to
  check pixel alignment. Embed the logos as inline
  assets.

  Phase 4 — Wire into the pipeline. Point TEMPLATE_FILES
  / the injectors at the new templates, add the new
  fields to the frontend form (store.js, form components,
  api.js payload builder), and extend
  validationService.js + frontend validator.js.

  Phase 5 — Verify. Generate each bill through the real
  API with the reference's own dummy values and compare
  side-by-side against the reference image; confirm
  single-page, correct fonts, no leaked/placeholder text,
  searchable dynamic fields.

  New fields these references need (not in our current 
  model)

  EDF exposes fields we don't currently capture:
  - A separate "Lieu de consommation" (service) address,
  distinct from the billing/"Titulaire" address.
  - Financial breakdown lines: Consommation sur index 
  réel, Abonnement et taxes, Total Hors TVA, Déduction 
  des prélèvements effectués (we currently only carry a
  total + VAT).
  - Prochaine facture and Prochain relevé dates.
  - Option Heures Pleines / Heures Creuses + the time
  window (e.g. 22H30–6H30).
  - Identifiant Internet, N° de compte (separate from
  client number). Note the PDL here is 14 889 131 824 370
  = 14 digits, which matches our validator. Good.

  Nicosia exposes:
  - A separate "Service location" address (ANDREA 
  CHADJETHEORE 18A, 2040 Strovolos) vs the customer's own
  address.
  - Consumer No. (8941).
  - The full itemized tariff table — Fixed charge /
  Consumption / Sewerage / VAT, each with VAT%, VAT€, and
  € columns — plus the 15 m³ @ 1.00 analysis line. In 
  our current template most of these were hardcoded
  literals; here they should probably be dynamic.
  - The barcode line and the 8941/7/17588/0/0 bottom
  reference.
