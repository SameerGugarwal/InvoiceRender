# Application Requirements & Data Schema

## 1. Project Overview
A **Single Page Application (SPA)** that acts as a template-based PDF generator. It takes user input through a dynamic frontend form and perfectly maps the data to 1:1 indexable PDF utility bills (EDF, Kenya Power, Water Board Nicosia).

## 2. UI / UX Layout & Flow
* **Note for UI:** For specific UI design guidelines, assess the `UI.md` file.
* **Top Section (Global Inputs):** All common/shared fields (Customer details, Billing dates, Financials) must be displayed at the very top of the SPA.
* **Middle Section (Template Selection & Preview):**
    * Display the 3 available templates as clickable options/cards.
    * **CRITICAL - Preview Feature:** When a template is clicked, it must open a preview showing the exact layout of that template populated with **dummy data**. This is very important for user reference before generating.
* **Bottom Section (Conditional Inputs):** Once a template is explicitly selected, render the specific required fields (like "Meter & Consumption Fields" and "Template-Specific Fields") directly below the template section.
* **Action Button:** A "Generate PDF" button at the bottom. When clicked, it must process the payload and return a fully **indexable PDF** (text must be selectable/searchable, not a flattened image).

---

## 3. Inputs Data Schema

### 1. Shared / Global Fields (Rendered for all templates)
**Customer & Location Details:**
* Customer Full Name
* Customer Address - Street / P.O. Box
* Customer Address - City
* Customer Address - Postal Code

**Billing & Dates:**
* Invoice / Bill Number
* Invoice Issue Date
* Billing Period Start Date
* Billing Period End Date
* Payment Due Date

**Financials:**
* Previous Balance
* Payments Received
* Taxes / VAT Rate (%)
* Taxes / VAT Amount
* Total Amount Due

### 2. Meter & Consumption Fields (Rendered for Kenya Power & Nicosia)
* Meter Number
* Exact Meter Reading Date
* Previous Meter Reading
* Current Meter Reading
* Total Consumption Units (kWh or m³)

### 3. Template-Specific Fields (Rendered conditionally)

**If "EDF Electricity" is selected:**
* Client Number (10 digits)
* Account Number
* Point of Delivery / PDL Number (14 digits)
* Subscribed Power (e.g., 9 kVA)
* Tariff Option (e.g., Base)
* Reading Type (Estimated or Actual)

**If "Kenya Power" is selected:**
* Account Number
* Tariff Category (e.g., Domestic)

**If "Water Board Nicosia" is selected:**
* Account Reference String (e.g., 8941/7/17588/0/0)
* Tariff / Pricing Code

---

## 4. Development Notes
* **Architecture:** SPA (Single Page Application) built with a modern frontend framework.
* **Backend Payload:** The JSON payload must include a `template_type` key to map data correctly.
* **Output:** Ensure the PDF generation library supports text layers so the output is an indexable PDF.
