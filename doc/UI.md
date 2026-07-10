# InvoiceRender - UI & UX Specifications

## 1. Design System & Aesthetics
* **Theme:** Clean, modern, and professional SaaS dashboard look. 
* **Color Palette:**
    * **Primary Accent:** A trustworthy Blue (e.g., `#2563EB` or Tailwind `blue-600`) for the main action buttons and active states.
    * **Background:** Very light gray/off-white (e.g., `#F8FAFC`) so the white form cards stand out.
    * **Text:** Dark slate (e.g., `#1E293B`) for headings, lighter gray (e.g., `#64748B`) for helper text and labels.
* **Typography:** Clean sans-serif like `Inter`, `Roboto`, or `Plus Jakarta Sans`.
* **Form Inputs:** Modern outlined inputs (Material-UI or Tailwind forms style) with soft rounded corners (`border-radius: 8px`). Focus states should have a subtle blue ring.

## 2. Page Layout (Top-to-Bottom Flow)
The SPA should follow a single-column, smoothly scrolling structure that intuitively guides the user from general data to specific data, and finally to generation.

### Section A: App Header
* **Branding:** "InvoiceRender" logo prominently displayed at the top left.
* **Style:** Sticky navbar with a slight shadow, keeping the brand visible as the user scrolls.

### Section B: Global Fields (Top Section)
* **Card Container:** Wrap these inputs in a clean white card with a subtle shadow (`box-shadow: 0 4px 6px rgba(0,0,0,0.05)`).
* **Grid Layout:** Use CSS Grid for the form fields. 
    * Desktop: 2 or 3 columns (e.g., Name next to Address, Dates grouped together).
    * Mobile: 1 column (100% width) for easy tapping.

### Section C: Template Selection & Preview (Middle Section)
* **Selection Cards:** The 3 templates (EDF, Kenya Power, Nicosia) should be displayed as large, clickable cards.
    * **Default State:** Muted border, grayscale or semi-transparent icon/thumbnail of the bill.
    * **Hover State:** Slight scale up (`transform: scale(1.02)`), stronger shadow.
    * **Active/Selected State:** Solid Primary Blue border, a checkmark icon appears in the corner, and the background gets a very faint blue tint.
* **Preview Modal/Panel:** * When a user clicks a template card (or a "Preview" icon on the card), a Modal overlay or an expanding accordion opens.
    * This preview MUST show a high-quality, uneditable image or read-only HTML layout of the chosen template, filled completely with **Dummy Data** so the user knows exactly what the output will look like.

### Section D: Conditional Inputs (Bottom Section)
* **Transitions:** When a template is selected in Section C, this bottom section should smoothly fade in or slide down (`transition: all 0.3s ease-in-out`).
* **Dynamic Rendering:** It should ONLY show the "Meter & Consumption" or "Template-Specific" fields relevant to the active template. 
* **Visual Separation:** Keep this in its own distinct white card, perhaps with a dynamic heading (e.g., "EDF Specific Details").

### Section E: The Action Area
* **Sticky Footer or Prominent Bottom Button:** A large, full-width (on mobile) or centered (on desktop) button labeled **"Generate Indexable PDF"**.
* **Button Styling:** Solid Primary color, bold text.
* **Feedback:** When clicked, it should show a loading spinner and change text to "Rendering..." to give the user immediate feedback while the backend processes the JSON.
