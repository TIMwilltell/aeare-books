# AeAre Books

A progressive web app for parents to scan book barcodes, auto-populate metadata (title, author, ISBN) from Open Library, attempt AR level/points lookup from arbookfind.com, and track reading progress and AR quiz scores for children.

## Features

- **Barcode Scanning** — Scan book barcodes with your phone's camera to quickly add books
- **Auto-Populate Book Data** — Automatically fetch title, author, and cover image from Open Library
- **AR Level Integration** — Fetch Accelerated Reader (AR) levels from arbookfind.com (with manual fallback)
- **Reading Progress Tracking** — Track when books are read with date tracking
- **Quiz Score Recording** — Record AR quiz scores for each book
- **Graceful Fallbacks** — If AR lookup fails, manual entry keeps the workflow moving
- **PWA** — Installable to home screen, works on iOS and Android

## Tech Stack

- **Frontend:** SvelteKit
- **Backend:** Convex (real-time database & serverless functions)
- **Local Storage:** Client-side persistence is partial and under active verification
- **Barcode Scanning:** Quagga
- **APIs:** Open Library, arbookfind.com (scraped)
- **Build:** Vite with PWA plugin
- **Package Manager:** Bun

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (or Node.js 18+)
- A [Convex](https://convex.dev/) deployment (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aeare.git
   cd aeare
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up Convex**
   ```bash
   bunx convex dev
   ```
   This will create a Convex deployment and set up the backend schema. Follow the prompts to authenticate with Convex.

4. **Configure environment variables**

   Create a `.env.local` file for the web app:

   ```bash
   # Convex URL used by the frontend client
   VITE_CONVEX_URL=https://your-deployment.convex.cloud

   # Auth0 SPA client settings
   VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
   VITE_AUTH0_CLIENT_ID=your-auth0-spa-client-id
   VITE_AUTH0_AUDIENCE=your-convex-api-audience

   # Optional override (defaults to window.location.origin)
   VITE_AUTH0_REDIRECT_URI=http://localhost:5173
   ```

   Configure matching Convex environment variables so `src/convex/auth.config.ts`
   can validate incoming JWTs:

   ```bash
   bunx convex env set AUTH0_DOMAIN https://your-tenant.us.auth0.com
   bunx convex env set AUTH0_APPLICATION_ID your-convex-api-audience
   ```

5. **Start the development server**
   ```bash
   bun dev
   ```

6. **Access the app**
   Open http://localhost:5173 in your browser. On mobile, use your computer's local IP address (e.g., http://192.168.1.x:5173) to test barcode scanning.

## Auth setup and recovery runbook

Phase 1 auth is built around Auth0 + Convex JWT validation. Use this checklist when onboarding a new machine or recovering from auth issues.

### Required environment variables

Frontend (`.env.local` or `.env`):

```bash
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-spa-client-id
VITE_AUTH0_AUDIENCE=your-convex-api-audience
VITE_AUTH0_REDIRECT_URI=http://localhost:5173
```

Convex deployment variables (must match Auth0 tenant/audience):

```bash
bunx convex env set AUTH0_DOMAIN https://your-tenant.us.auth0.com
bunx convex env set AUTH0_APPLICATION_ID your-convex-api-audience
```

### Provider setup checklist (Auth0 dashboard)

1. Create or open a **Single Page Application**.
2. Set **Allowed Callback URLs** to your local and deployed URLs (for local dev: `http://localhost:5173`).
3. Set **Allowed Logout URLs** to the same origins (for local dev: `http://localhost:5173`).
4. Ensure API audience matches `VITE_AUTH0_AUDIENCE` and `AUTH0_APPLICATION_ID`.
5. Keep `Token Endpoint Authentication Method` compatible with SPA defaults.

### Recovery guide

- **"Missing auth environment values" on load or sign-in**
  - Confirm all `VITE_AUTH0_*` values are present in frontend env.
  - Restart `bun dev` after env updates.

- **Signed in, but account bootstrap fails**
  - Confirm `AUTH0_DOMAIN` and `AUTH0_APPLICATION_ID` are set in Convex env.
  - Confirm Auth0 API audience exactly matches `AUTH0_APPLICATION_ID`.
  - Retry using the in-app **Retry authentication** button.

- **401/403 from Convex after successful Auth0 login**
  - Check Auth0 issuer URL format (`https://<tenant>.us.auth0.com`).
  - Re-run `bunx convex env list` and verify domain/audience values.
  - Sign out and sign in again to refresh token claims.

- **Stuck redirect callback (`?code=...&state=...`)**
  - Verify callback URL is allowed in Auth0 app settings.
  - Ensure `VITE_AUTH0_REDIRECT_URI` points at the served app origin.
  - Clear site storage for local host and retry sign-in.

## Usage

### Adding a Book

1. Tap the scan button (+) on the home screen
2. Allow camera access when prompted
3. Point your camera at a book barcode
4. The app will automatically look up the book and populate the form
5. Confirm or edit the details and save

### Tracking Reading Progress

1. Open any book in your library
2. Mark the book as "read" using the toggle
3. Select the date the book was finished
4. Optionally enter an AR quiz score

### Offline Use

The app is designed to keep key flows usable with degraded behavior when network or AR lookups fail. True offline persistence remains an active verification item.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is currently unlicensed. Contact the author for usage permissions.
