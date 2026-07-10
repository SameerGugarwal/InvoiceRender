# InvoiceRender - Tech Stack & Architecture Guide

## 1. Chosen Tech Stack
* **Frontend:** Vanilla JavaScript, Tailwind CSS, Vite
* **Backend:** Node.js, Express.js

This is a fantastic, lean stack for a stateless PDF generator. Vite will make your Vanilla JS and Tailwind compilation lightning-fast, and Node/Express is perfect for handling JSON payloads and rendering PDFs asynchronously.

## 2. Recommended Architecture & Libraries

### Frontend (Vite + Vanilla JS + Tailwind)
* **State Management:** Since you are using Vanilla JS, use a simple central JavaScript object `let appState = {}` to store user inputs before sending them to the backend.
* **UI/Styling:** Tailwind CSS will easily handle the responsive grid layouts and modern UI elements described in `UI.md`.
* **API Calls:** Use the native `fetch()` API to send a POST request with the JSON payload to your Express server.

### Backend (Node.js + Express.js)
* **PDF Generation Library:** Use **Puppeteer** (`npm install puppeteer`). It runs a headless Chrome browser, which means it will render your HTML templates with 100% CSS accuracy and export them as **Indexable PDFs** (text is selectable).
* **Templating:** Use a lightweight template engine like **EJS** or **Handlebars** (`npm install ejs`), or simply use JavaScript Template Literals to inject the frontend JSON payload into your raw HTML strings.
* **CORS:** Don't forget to use the `cors` middleware (`npm install cors`) since your Vite frontend and Express backend will run on different local ports during development.

---

## 3. Recommended Folder Structure
For a clean separation of concerns, set up your project as a monorepo with two main folders:

```text
/InvoiceRender-Project
│
├── /frontend               # Vite + Vanilla JS + Tailwind
│   ├── index.html          # Main SPA layout
│   ├── /src
│   │   ├── main.js         # Form logic, state handling, fetch calls
│   │   ├── style.css       # Tailwind directives
│   │   └── /templates      # Dummy images for the Preview Modal
│   ├── tailwind.config.js
│   └── package.json
│
└── /backend                # Node.js + Express
    ├── server.js           # Express app setup & API endpoints
    ├── /templates          # The actual HTML files (EDF, Kenya Power, Nicosia)
    ├── /services
    │   └── pdfGenerator.js # Puppeteer logic to compile HTML to PDF
    └── package.json
```

## 4. The Data Flow (How it works)
1. User fills out the Tailwind-styled form in the **Frontend**.
2. Clicking "Generate PDF" triggers a `fetch` POST request in `main.js`, sending the `appState` JSON to the **Backend** (e.g., `http://localhost:3000/api/generate-pdf`).
3. **Express** receives the JSON, reads the `template_type` (e.g., "EDF"), and injects the JSON data into the corresponding HTML template.
4. **Puppeteer** loads the populated HTML, generates an indexable PDF buffer in memory.
5. Express sends the PDF buffer back to the frontend with the header `Content-Type: application/pdf`.
6. The frontend automatically triggers a file download for the user.
