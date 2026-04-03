# App version in Firebase / GA4

The site sends **`app_version`** (from `package.json` → `version`) and **`web_app_name`** on every analytics event and as **user properties**.

## Release workflow

1. Bump **`package.json`** → `"version"` (e.g. `1.0.0` → `1.0.1` or `1.1.0`).
2. Commit, push, and deploy. Each build bakes the current version into the bundle.

Older builds still in users’ caches will continue reporting their baked-in version until they load a new deploy.

## Where to see versions

- **Google Analytics (linked to Firebase)**  
  **Explore** → create a report → add dimension **`app_version`** (or **`User property: app_version`**) if registered.
- **Firebase Console**  
  **Analytics** → **Events** / **DebugView**: event parameters include `app_version` when sent via default parameters.

## Register custom definitions (recommended)

In **Google Analytics** (GA4):

1. **Admin** → (your property) → **Custom definitions**.
2. Create **custom dimensions** as needed:
   - **Event-scoped:** parameter name `app_version` (matches default event parameters).
   - **User-scoped:** user property `app_version` / `web_app_name` (matches `setUserProperties`).

Names must match what the app sends: `app_version`, `web_app_name`.

After data flows, you can break down traffic and funnels by **version**.
