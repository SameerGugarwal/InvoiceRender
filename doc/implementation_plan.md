# InvoiceRender – Phase 1 Core Build Plan

## Overview
Build a complete SPA (frontend + backend) that takes user input via a dynamic form and generates 1:1 indexable PDF utility bills using Puppeteer against the provided self-contained HTML templates.

---

## User Review Required

> [!IMPORTANT]
> **Template Injection Strategy**: The provided HTML templates in `/doc/templets/` are self-contained "bundled" files (~100-170KB each) with base64-encoded assets and JavaScript that unpacks them in the browser. They are **not** simple HTML with placeholders — they are bundled React/Babel apps.
>
> **Proposed approach**: Rather than trying to parse and inject variables into these complex bundles (which would be fragile), Puppeteer will:
> 1. Load each template HTML file directly via `file://` protocol
> 2. Wait for the bundled JS to unpack and render the full bill
> 3. Use `page.evaluate()` to find and replace text content in the rendered DOM with user-supplied values
> 4. Generate the PDF from the fully-rendered page
>
> This is the safest approach given the bundle format. Please confirm if this is acceptable or if you have the **unbundled** source HTML templates that use simple placeholders like `{{customerName}}`.

> [!WARNING]
> **Template Preview Modal**: The spec requires showing a "high-quality, uneditable image or read-only HTML layout" of each template populated with dummy data. Since the templates are ~100-170KB self-contained HTML files, embedding them as iframes in the frontend would be very heavy. Instead, I'll create **static SVG preview cards** for each template (styled to match each bill's visual identity) that open in a modal when clicked. If you have screenshots/images of the rendered bills, those would be ideal to use instead.

## Open Questions

> [!IMPORTANT]
> 1. **Do you have unbundled/source HTML templates?** The provided templates are complex JS bundles. Having simple HTML with placeholder variables (e.g., `{{customer_name}}`) would make data injection much more reliable.
> 2. **Preview images**: Do you have screenshots of each rendered bill? These would be perfect for the preview modal instead of attempting to render 100KB+ bundles inline.

---

## Proposed Changes

### Frontend (`/frontend`)

#### [NEW] `package.json`
- Vite + Tailwind CSS dev dependencies
- Scripts: `dev`, `build`, `preview`

#### [NEW] `index.html`
- Main SPA shell following [UI.md](file:///Users/sameerchoudhary/Desktop/enovate-IT/InvoiceRender/doc/UI.md) layout:
  - **Section A**: Sticky header with "InvoiceRender" branding
  - **Section B**: Global Fields card (Customer, Billing, Financials) in responsive grid
  - **Section C**: Template Selection cards (EDF, Kenya Power, Nicosia) with hover/active states + preview modal
  - **Section D**: Conditional inputs (Meter fields, Template-specific fields) with slide-in animation
  - **Section E**: Generate PDF action button with loading state

#### [NEW] `src/main.js`
- Central `appState` object holding all form field values
- Template selection logic with visual highlighting
- Dummy data preview modal rendering
- Conditional field rendering based on selected template:
  - **EDF**: Client Number (10 digits), Account Number, PDL (14 digits), Subscribed Power, Tariff Option, Reading Type
  - **Kenya Power + Nicosia**: Meter fields (Meter Number, Reading Date, Previous/Current Reading, Consumption)
  - **Kenya Power**: Account Number, Tariff Category
  - **Nicosia**: Account Reference String (`XXXX/X/XXXXX/X/X`), Tariff/Pricing Code
- Strict validation per [Critical Instructions](file:///Users/sameerchoudhary/Desktop/enovate-IT/InvoiceRender/doc/Critical%20Instructions):
  - EDF PDL: exactly 14 digits
  - EDF Client Number: exactly 10 digits
  - Nicosia Account Reference: `XXXX/X/XXXXX/X/X` format
  - All dates: `DD/MM/YYYY` format
- `fetch` POST to backend with JSON payload + `template_type` key
- PDF download trigger from response blob

#### [NEW] `src/style.css`
- Tailwind directives (`@tailwind base`, `components`, `utilities`)
- Custom component classes for form cards, inputs, buttons

#### [NEW] `tailwind.config.js`
- Content paths, Inter font family, custom colors from UI.md palette

#### [NEW] `postcss.config.js`
- Tailwind + autoprefixer plugins

#### [NEW] `vite.config.js`
- Basic Vite config

---

### Backend (`/backend`)

#### [NEW] `package.json`
- Dependencies: `express`, `cors`, `puppeteer`
- Scripts: `start`, `dev`

#### [NEW] `server.js`
- Express app on port 3000
- CORS middleware
- `POST /api/generate-pdf` endpoint
- Receives JSON payload, validates `template_type`
- Calls `pdfGenerator.generatePDF()`
- Returns PDF buffer with `Content-Type: application/pdf`

#### [NEW] `services/pdfGenerator.js`
- Launches Puppeteer (headless Chrome)
- Loads the correct template HTML from `/templates/` via `file://` protocol
- Waits for template to fully render (waits for bundle unpack)
- Injects form data into the rendered DOM via `page.evaluate()`
- Generates PDF with exact settings from [Critical Instructions](file:///Users/sameerchoudhary/Desktop/enovate-IT/InvoiceRender/doc/Critical%20Instructions):
  ```javascript
  await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  });
  ```

#### [NEW] `templates/` (directory)
- Copies of the 3 HTML template files from `/doc/templets/`

---

## Verification Plan

### Automated Tests
- `cd frontend && npm run build` — verify frontend builds without errors
- `cd backend && node -e "require('./services/pdfGenerator')"` — verify backend module loads

### Manual Verification
- Start frontend dev server (`npm run dev`) and verify:
  - All global fields render
  - Template selection highlights correctly
  - Preview modal shows dummy data layout
  - Conditional fields appear/disappear per template
  - Validation blocks submission for invalid inputs
  - Dates enforce DD/MM/YYYY
  - EDF: PDL requires 14 digits, Client Number requires 10 digits
  - Nicosia: Account Reference enforces `XXXX/X/XXXXX/X/X`
- Start backend (`node server.js`) and test PDF generation end-to-end
- Verify generated PDF is A4, full-bleed, has selectable text
