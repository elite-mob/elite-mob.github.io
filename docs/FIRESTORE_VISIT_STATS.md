# Footer visit stats (Firestore)

The footer can show **total visits** and **top countries** (same UX as the old Supabase setup). This uses **Firebase Firestore** plus **Anonymous Authentication** and the same Firebase web config as Analytics.

## 1. Firebase Console

1. Create or open a project at [Firebase Console](https://console.firebase.google.com/).
2. Add a **Web** app and copy config into your `.env` / hosting secrets (`VITE_FIREBASE_*`).
3. Enable **Firestore** (Native mode) in **Build → Firestore Database**.
4. Enable **Authentication → Sign-in method → Anonymous** (required for writing stats).
5. Deploy **security rules** (see `firestore.rules` in this repo):  
   - `site_stats/summary`: **read** public, **create/update** only for signed-in users (anonymous counts).

   ```bash
   firebase deploy --only firestore:rules
   ```

   Or paste the rules from `firestore.rules` into the Firestore **Rules** tab.

## 2. Behaviour

- On first load per **browser session**, the app signs in **anonymously**, resolves country via [ipapi.co](https://ipapi.co) in the browser, then runs a **transaction** on `site_stats/summary` to increment totals and merge country counts.
- The footer **subscribes** to `site_stats/summary` for live updates.

If Firebase env vars are missing, visit recording and footer stats are skipped (no errors).

## 3. Optional: Analytics only

If you only want GA4 and **no** footer numbers, leave Firestore rules strict and do not enable Anonymous auth; the app will still run; stats UI stays hidden.
