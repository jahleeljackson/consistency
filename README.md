# Cairn

A calm habit app that makes consistency visible. Each completed mission adds a stone to a cairn. Stones are never removed.

## Local development

```bash
npm install
npm run dev
npm test
```

For the shared Netlify Blobs store locally:

```bash
npx netlify dev
```

Without `netlify dev`, the app still works with IndexedDB on this device.

## Deploy on Netlify

1. Connect this repository to Netlify, or drag the project into the Netlify dashboard.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Functions directory: `netlify/functions`

The site uses one shared JSON document in Netlify Blobs. Anyone with the URL can read and write that data, so keep the Netlify URL private.

## Data

- Local cache: IndexedDB
- Shared store: `GET` / `PUT` `/api/state`
- Settings include JSON export and import
