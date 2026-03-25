# AeAre Books

A PWA for scanning book barcodes, auto-populating book data (title, author, ISBN, AR level), and tracking reading progress and quiz scores for children.

## Features

- **Barcode Scanning** — Scan book barcodes with your phone's camera to quickly add books
- **Auto-Populate Book Data** — Automatically fetch title, author, and cover image from Google Books API
- **AR Level Integration** — Fetch Accelerated Reader (AR) levels from arbookfind.com (with manual fallback)
- **Reading Progress Tracking** — Track when books are read with date tracking
- **Quiz Score Recording** — Record AR quiz scores for each book
- **Offline-First** — Works offline using IndexedDB, syncs to the cloud when connected
- **PWA** — Installable to home screen, works on iOS and Android

## Tech Stack

- **Frontend:** SvelteKit
- **Backend:** Convex (real-time database & serverless functions)
- **Local Storage:** Dexie.js (IndexedDB wrapper)
- **Barcode Scanning:** Quagga
- **APIs:** Google Books API, arbookfind.com (scraped)
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
   
   Create a `.env.local` file:
   ```bash
   CONVEX_DEPLOYMENT=your-convex-deployment-url
   PUBLIC_CONVEX_URL=your-convex-deployment-url
   ```

5. **Start the development server**
   ```bash
   bun dev
   ```

6. **Access the app**
   Open http://localhost:5173 in your browser. On mobile, use your computer's local IP address (e.g., http://192.168.1.x:5173) to test barcode scanning.

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

The app works offline by storing data locally first. When you reconnect, changes automatically sync to Convex.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is currently unlicensed. Contact the author for usage permissions.
