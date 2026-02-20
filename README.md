# Student Finance Tracker

A responsive, accessible expense tracker built with vanilla HTML/CSS/JS. Base currency: RWF, with support for any user‑added currency.

## Live Demo (GitHub Pages)
https://alvinmutangana.github.io/Student-Finance-Tracker/

## Features
- Add, edit, delete expenses
- Regex‑validated form (description, amount, date, category)
- Live regex search with highlighting
- Sort by description, amount, date
- Dashboard: total records, total spent, top category, 7‑day trend
- Monthly cap with ARIA live warnings
- Custom currencies – users can add any currency and set its rate
- Import/export JSON with validation
- Fully responsive (mobile, tablet, desktop)
- Keyboard accessible, skip link, ARIA landmarks

## Regex Catalog
| Field       | Pattern                                  | Example                |
|-------------|------------------------------------------|------------------------|
| Description | `\b(\w+)\s+\1\b` (duplicate consecutive words) | "the the" → invalid |
| Amount      | `^(0|[1-9]\d*)(\.\d{1,2})?$`            | 12.50, 0.99            |
| Date        | `^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$` | 2025-09-29       |
| Category    | `^[A-Za-z]+(?:[ -][A-Za-z]+)*$`          | "Food", "Extra-Curricular" |

## Keyboard Navigation
- **Tab** moves through interactive elements.
- **Enter/Space** activates buttons.
- **Skip link** (first tab) jumps to main content.
- **Focus rings** are clearly visible (orange outline).

## Accessibility Notes
- All form inputs have associated `<label>`.
- ARIA `role="status"` and `aria-live` used for cap messages.
- Color contrast ratios exceed WCAG AA (checked with DevTools).
- Mobile cards use `data-label` for screen readers.

## Running Tests
Open `tests/tests.html` in any browser to run basic validator assertions (results shown on page).

Setup
1. Clone the repository.
2. Serve with any static server (e.g., `npx live-server`).
3. No build step required — pure HTML/CSS/JS.

## Data Persistence
All changes are auto‑saved to `localStorage`. Use the Settings panel to export/import JSON backups.

## Milestone Progress
This project follows the M1–M7 milestones, with commits reflecting each stage (see repository history).
