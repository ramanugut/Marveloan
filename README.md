# Marveloan

This project contains a set of demo HTML pages for a loan management
system interface. The files are organized into dedicated folders:

- `html/` – all HTML pages such as `index.html`, `dashboard.html`, and others
- `css/` – styles extracted from each page
- `js/` – JavaScript modules including `firebase-config.js`

A lightweight `index.html` at the repository root simply redirects to
`html/index.html` so GitHub Pages can load the site from the standard
root URL.

Users can register via `html/signup.html` and then log in through
`html/index.html`. After authentication you are taken to
`html/dashboard.html` which links to various functional pages,
including the **Collections** screen located at `html/collections.html`.
