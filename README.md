# InvoiceRender

**InvoiceRender** is a template-based utility-bill PDF generator. A dynamic single-page form collects billing data and maps it 1:1 onto pixel-perfect, **fully text-searchable (indexable)** PDF utility bills rendered by headless Chrome.

The form is built for speed: pick a template, change the customer name, and generate — every other field is pre-filled with a sensible default, and all dates are computed live from the day the bill is generated.

## Supported templates

| Template | Country | `template_type` |
| --- | --- | --- |
| EDF Electricity | France | `edf` |
| EDF Electricity V2 | France | `edf_v2` |
| Kenya Power | Kenya | `kenya_power` |
| Water Board Nicosia | Cyprus | `nicosia` |

> `edf` and `edf_v2` are two independent EDF layouts kept side by side for comparison and gradual migration. The Nicosia bill also renders an Apostille certificate and a sworn-translation certificate.

## Features

- **Indexable PDF generation** — Puppeteer renders each HTML template to a full-bleed PDF with selectable, searchable text (not a flattened image).
- **Smart defaults** — selecting a template fills every field with template-appropriate defaults, so a bill can be produced by changing only the customer name.
- **Live dates** — issue date, due date, billing period and reading/certificate dates are derived from the current date (issue = today − 10 days, due = today + 15 days) and refreshed on load and before every generate, so a bill is never produced with stale dates.
- **Derived, self-consistent figures** — template injectors compute the money breakdown so the printed line items always reconcile with the total (e.g. the Kenya bill's energy cost, VAT and carried balance sum to the amount payable), and the Kenya consumption-trend chart is scaled to the real figures.
- **Live template preview** — each template card opens a modal showing the backend-rendered HTML populated with the current form data.
- **Strict validation** — enforced on both client and server (e.g. `DD/MM/YYYY` dates, 10-digit EDF client number, 14-digit PDL, `XXXX/X/XXXXX/X/X` Nicosia account reference).
- **Persistent form state** — the form is saved to `localStorage`; a normal refresh keeps it, while a hard refresh (`Ctrl/Cmd + Shift + R`) resets it to defaults.

## Tech stack

**Frontend:** Vanilla JavaScript · Tailwind CSS · Vite
**Backend:** Node.js · Express · Puppeteer (headless-Chrome PDF rendering) · Handlebars (HTML templating) · pdf-parse

## How it works

```
Frontend form
  → buildPayload()          flat form fields → nested JSON payload
  → POST /api/generate-pdf
  → pdfController           validates, switches on template_type
  → template injector       computes derived fields: dates, money, chart
  → templateService         loads the raw HTML template
  → Handlebars              fills placeholders
  → Puppeteer               renders to an indexable PDF
  → PDF download
```

Each template has its own injector under `backend/services/templates/`, so template-specific logic (French money formatting, Kenya's reconciling breakdown, Nicosia's apostille/certificate blocks) stays isolated.

## Project structure

```text
InvoiceRender/
├── backend/                      # Node.js + Express API
│   ├── config/                   # Puppeteer launch/render config
│   ├── controllers/              # pdfController.js — request handling + template switch
│   ├── middleware/               # errorHandler.js
│   ├── routes/                   # pdfRoutes.js
│   ├── services/
│   │   ├── puppeteerService.js   # HTML → PDF rendering
│   │   ├── templateService.js    # template_type → HTML file resolution
│   │   ├── validationService.js  # server-side payload validation
│   │   └── templates/            # per-template injectors (edf, edfV2, kenya, nicosia)
│   ├── templates/                # HTML bill templates (Handlebars)
│   └── server.js                 # Express entry point
│
├── frontend/                     # Vite + Vanilla JS SPA
│   ├── src/
│   │   ├── components/           # form, template cards, dynamic sections, preview modal
│   │   ├── services/             # api.js (payload builder), validator.js
│   │   ├── state/                # store.js — state, defaults, live-date engine
│   │   └── main.js               # app bootstrap
│   ├── index.html                # SPA layout
│   └── vite.config.js
│
├── doc/                          # Specs, reference PDFs, source templates & logos
├── Dockerfile                    # Backend container (Chrome + Node)
└── README.md
```

## Getting started

Requires [Node.js](https://nodejs.org/) 18+.

### 1. Clone

```bash
git clone <your-repo-url>
cd InvoiceRender
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

Runs on `http://localhost:3000`. On first install Puppeteer downloads a Chromium build; the config also auto-detects a system Chrome if one is present.

### 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite serves the app (typically `http://localhost:5173`). Open it in your browser.

## Usage

1. Open the app.
2. Select a template — the form fills with defaults and the template-specific section appears.
3. Change whatever you need (often just the customer name).
4. Optionally click **Preview** on a card to see the rendered bill.
5. Click **Generate PDF** — the file downloads automatically.

## API

Base URL: `http://localhost:3000`

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check (`{ status: "ok" }`). |
| `POST` | `/api/generate-pdf` | Accepts a bill payload, returns the rendered PDF. |
| `POST` | `/api/preview-html` | Returns populated HTML for the preview modal. |
| `GET` | `/api/templates/:name` | Returns a raw HTML template. |

### Payload shape

`POST /api/generate-pdf` expects a nested JSON body. `template_type`, `customer`, `billing` and `financials` are always required; the remaining blocks apply to specific templates.

```jsonc
{
  "template_type": "edf",
  "customer":   { "fullName": "", "street": "", "city": "", "postalCode": "" },
  "billing":    { "invoiceNumber": "", "issueDate": "DD/MM/YYYY", "periodStart": "DD/MM/YYYY",
                  "periodEnd": "DD/MM/YYYY", "dueDate": "DD/MM/YYYY" },
  "financials": { "previousBalance": "", "paymentsReceived": "", "vatRate": "",
                  "vatAmount": "", "totalAmountDue": "" },

  "edfSpecific":    { "clientNumber": "", "accountNumber": "", "pdlNumber": "",
                      "subscribedPower": "", "tariffOption": "", "readingType": "" },
  "meter":          { "number": "", "readingDate": "", "previousReading": "",
                      "currentReading": "", "consumptionUnits": "" },
  "kenyaSpecific":  { "accountNumber": "", "tariff": "", "maxAuthorizedLoad": "",
                      "email": "", "consumptionHistory": "520, 610, 700, 640, 580, 660" },
  "nicosiaSpecific":{ "accountRef": "XXXX/X/XXXXX/X/X", "tariff": "" },
  "apostille":      { "country": "", "signedBy": "", "capacity": "", "organization": "",
                      "location": "", "date": "", "certifiedBy": "", "referenceNumber": "" },
  "certificate":    { "translatorName": "", "city": "", "country": "", "idNumber": "",
                      "company": "", "sourceLanguage": "", "targetLanguage": "",
                      "documentType": "", "customerName": "", "address": "", "phone": "",
                      "email": "", "translatorRole": "", "date": "" }
}
```

The frontend's `buildPayload()` assembles this from the flat form fields.

### Validation rules

- All dates: `DD/MM/YYYY`
- EDF client number: exactly 10 digits · EDF PDL: exactly 14 digits
- Nicosia account reference: `XXXX/X/XXXXX/X/X`

## Deployment

The backend ships as a Docker image (`Dockerfile`) based on `node:18` with Google Chrome and fonts preinstalled; Puppeteer uses the system Chrome via `PUPPETEER_EXECUTABLE_PATH`.

For [Render](https://render.com/), `backend/render-build.sh` installs dependencies plus a project-local Chrome cache that survives into the runtime instance. Set the frontend's API base URL via `VITE_API_BASE_URL` (see `frontend/.env.production`); the backend's allowed CORS origins are configured in `backend/server.js`.
