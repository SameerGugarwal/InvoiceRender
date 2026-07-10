# InvoiceRender - Master Development & Verification Workflow

## 1. Pre-requisite Context & Reference Files
Before starting any code generation or architecture setup, Antigravity MUST read, parse, and strictly follow the instructions across all the existing workspace files listed below:

1. **`Application_Requirements.md`**: Contains the full core functionality and the exact input fields schema categorized by Global, Meter, and Template-Specific scopes.
2. **`UI.md`**: Outlines the comprehensive Single Page Application (SPA) layout, modern theme setup, responsive CSS grids, hover states, active states, and the critical dummy data preview modal flow.
3. **`Tech_Stack_Setup.md`**: Defines the approved technical framework (Frontend: Vanilla JS + Tailwind CSS + Vite; Backend: Node.js + Express.js + Puppeteer) and the expected decoupled directory structure.
4. **`Antigravity_Instructions.md`**: Highlights the rigid production-grade constraints regarding frontend regex validation and flawless 1:1 asset rendering via Base64/local paths.
5. **`/doc/templets/`**: The absolute path hosting the 3 original HTML raw templates (EDF, Kenya Power, Nicosia Water) that must be utilized for background parsing.

---

## 2. Phase 1: Core Execution Lifecycle
* **Step 1:** Read and completely map out the state structures using the fields provided in `Application_Requirements.md`.
* **Step 2:** Build the entire interactive frontend layout exactly following the scrolling hierarchy defined in `UI.md`.
* **Step 3:** Implement the backend Puppeteer instance utilizing the strict settings required in `Antigravity_Instructions.md`.

---

## 3. Phase 2: Mandatory Post-Build Cross-Checking
Once the application build phase is visually and structurally complete, Antigravity **MUST re-read all reference documents** and cross-verify the implementation layer by layer. 

### The Verification Checklist:
* [ ] **Data Integrity Check:** Cross-reference the live state structure against the exact fields list in `Application_Requirements.md`. Ensure zero fields are missing or misspelled.
* [ ] **UI/UX Consistency Check:** Verify that the layout flows precisely from top to bottom as described in `UI.md` and that clicking on a template successfully loads an uneditable layout populated with complete mock/dummy data.
* [ ] **Strict Form Validation Check:** Test that the system prevents generation unless the exact constraints (e.g., 14-digit PDL, specific Cypriot slash format) are fully satisfied.
* [ ] **PDF Quality Check:** Verify that the compiled output is completely indexable (text selection layer is active) and that the viewport rendering utilizes full bleed zero-margins with backgrounds enabled (`printBackground: true`).

---

## 4. Phase 3: Iterative Refinement
If any discrepancy, design drift, missing validation, or layout brokenness is discovered during the Phase 2 cross-check, Antigravity must automatically log the delta, refactor the code base, and perform the verification routine again until a 100% compliant, production-grade output matching all documents is achieved.
