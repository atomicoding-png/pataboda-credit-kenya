# PATABODA CREDIT KENYA

A modern, mobile-first financing application website for boda boda riders in Kenya.

## Features

- Responsive landing page with dark professional branding
- Multi-step application form for rider financing
- Review screen before final submission
- WhatsApp-ready submission flow with configurable number
- Confirmation screen with generated reference ID
- Secure admin dashboard with password protection
- Search, filtering, notes, and status updates for applications
- Configurable business details and financing settings
- Privacy policy and terms & conditions pages
- CSV export support for applications

## Run locally

Open `index.html` directly in the browser, or serve the project with a simple local web server:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Admin login

Default password for the prototype dashboard:

```text
pataboda-admin-2025
```

This is intentionally a prototype front-end. Before launch, update the business contact details, WhatsApp number, office address, and legal wording in the admin dashboard.

## Notes

- Uploaded document names are stored only as metadata in the browser for demo purposes.
- Real production use should move to a secure backend and protected database.
- The provided logo is a branded placeholder created to match the requested look and feel until the actual uploaded graphic is added.
