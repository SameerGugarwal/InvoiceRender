# InvoiceRender

**InvoiceRender** is a powerful Single Page Application (SPA) designed to act as a template-based PDF generator. It provides a dynamic frontend form that allows users to input billing data and seamlessly maps it to 1:1 indexable PDF utility bills. 

Currently supported templates:
- EDF Electricity Bill
- Kenya Power
- Water Board Nicosia

## 🚀 Features

- **Dynamic UI Form**: A responsive and modern interface to input global, meter, and template-specific details.
- **Template Preview**: Clickable templates with live dummy data previews to visualize the layout before generation.
- **Indexable PDF Generation**: Uses headless Chrome (Puppeteer) to render HTML templates and generate fully text-searchable (indexable) PDFs, preserving high-quality layouts (full bleed, background graphics).
- **Strict Validation**: Enforces exact data constraints (e.g., 14-digit PDL numbers, specific tariff codes) required by each specific utility company.
- **Stateless Architecture**: Clean separation between frontend (Vite) and backend (Express).

## 🛠️ Tech Stack

**Frontend:**
- Vanilla JavaScript
- Tailwind CSS
- Vite

**Backend:**
- Node.js & Express.js
- Puppeteer (for headless PDF generation)
- Handlebars (for HTML templating)
- PDF-Parse (for PDF validation/parsing)

## 📁 Project Structure

```text
InvoiceRender/
├── backend/                # Node.js + Express backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middlewares (e.g., error handler)
│   ├── routes/             # API routes (e.g., pdfRoutes.js)
│   ├── services/           # Business logic (Puppeteer, Template parsing)
│   ├── templates/          # HTML templates for rendering
│   └── server.js           # Main Express server entry point
│
├── frontend/               # Vite + Vanilla JS frontend
│   ├── src/                # JS logic (main.js) and state management
│   ├── index.html          # Main SPA layout
│   ├── style.css           # Tailwind directives
│   ├── tailwind.config.js  # Tailwind configuration
│   └── vite.config.js      # Vite configuration
│
└── doc/                    # Project documentation and specifications
```

## ⚙️ Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd InvoiceRender
```

### 2. Setup Backend
```bash
cd backend
npm install
npm run dev
```
The backend server will start running on `http://localhost:3000`.

### 3. Setup Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The Vite development server will start, typically on `http://localhost:5173`. Open this URL in your browser.

## 📖 Usage

1. Open the frontend application in your browser.
2. Fill in the **Global Inputs** (Customer Details, Billing Dates, Financials).
3. Select a **Template** (e.g., EDF Electricity). A preview modal will show the exact layout of the selected template.
4. Fill in the conditional **Template-Specific Fields** that appear at the bottom.
5. Click **Generate PDF**. The backend will process the payload and a PDF file will be downloaded to your machine automatically.

## 📡 API Endpoints

- `GET /api/health` - Health check endpoint.
- `POST /api/generate-pdf` - Accepts JSON payload and returns the compiled PDF buffer.
- `POST /api/preview-html` - Returns populated HTML for preview purposes.
- `GET /api/templates/:name` - Retrieves a specific HTML template.
