# ShopBook — പറ്റ് രജിസ്റ്റർ & സാധന ഓർമ്മക്കുറിപ്പ്
### Digital Shop Patt Register & Purchase Reminder (Majeed's Tea Stall / മജീദിന്റെ ചായക്കട)

A minimal, classic, mobile-first shop ledger and purchase reminder web application built for 5 shop staff sharing the same Cloud Firestore database.

---

## ☕ Key Features

1. **Traditional Kerala Shop Ledger Aesthetics**:
   - Styled after classic cloth-bound *Kanakku Pusthakam* (കണക്ക് പുസ്തകം).
   - Warm cream (`#F7F5EF`), Forest green (`#173F2B`), Sage green (`#DDE7D8`), and Kettle Gold (`#E5A914`).
   - Custom app icon with the traditional tea kettle logo ("മജീദിന്റെ ചായക്കട").

2. **Mobile-First & PWA Installable**:
   - Touch-friendly 48px+ tap targets.
   - Numeric keypad for rapid entry (`inputMode="decimal"`).
   - "Add to Home Screen" support on Android & iPhone so it works like a native mobile app.

3. **Multiple Daily Patt Entries**:
   - Customers can take patt 5, 10, or more times on the same day (e.g. ₹26 at 10:24 AM, ₹45 at 11:05 AM, ₹80 at 12:30 PM).
   - Every transaction is preserved with unique ID, exact IST time, creator name, and optional note.
   - Automatic calculation: Today's patt, All-time total, and Current outstanding balance.

4. **1-Tap WhatsApp Reminder**:
   - Click "WhatsApp അറിയിപ്പ്" to generate a polite Malayalam reminder with the customer's exact balance and open WhatsApp.

5. **5-Staff Shared Cloud Database**:
   - 5 authorized shop members (Majeed, Shaheer, Subair, Anwar, Rasheed).
   - Real-time synchronization using Cloud Firestore (`onSnapshot`).
   - Seamless offline & local sync fallback when running without Firebase credentials.

6. **Purchase Reminder (സാധന ഓർമ്മക്കുറിപ്പ്)**:
   - Shared checklist of shop supplies to buy (Milk, Sugar, Tea powder, Cups, Oil, etc.).
   - Tap to check off as purchased, real-time sync across all 5 phones.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```

Visit the displayed local URL (e.g. `http://localhost:5173`) in your browser or phone on the same Wi-Fi.

---

## ☁️ Firebase Spark (Free Plan) Setup Guide

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com).
2. Click **Add project** and name it `ShopBook`.
3. Disable Google Analytics (optional, keeps setup minimal) and click **Create project**.
4. Keep the default **Spark Plan** (100% Free, includes 50k reads & 20k writes daily).

### 2. Enable Firebase Authentication
1. Go to **Build > Authentication** > Click **Get Started**.
2. Select **Email/Password** > Enable it > Click **Save**.
3. Under the **Users** tab, click **Add user** to create login accounts for the 5 shop members:
   - `majeed@shopbook.app` (Owner)
   - `shaheer@shopbook.app` (Staff 1)
   - `subair@shopbook.app` (Staff 2)
   - `anwar@shopbook.app` (Staff 3)
   - `rasheed@shopbook.app` (Staff 4)

### 3. Create Cloud Firestore Database
1. Go to **Build > Firestore Database** > Click **Create database**.
2. Select database location: `asia-south1 (Mumbai)` for ultra-fast response in Kerala.
3. Start in **Production mode**.
4. Go to the **Rules** tab, paste the contents of [`firestore.rules`](./firestore.rules), and click **Publish**.

### 4. Connect Web App Credentials
1. Go to **Project Settings** (gear icon) > **General**.
2. Under **Your apps**, click the Web icon `</>` to register a web app.
3. Copy your `firebaseConfig` keys into `.env` (refer to [`.env.example`](./.env.example)):
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=shopbook.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=shopbook
   VITE_FIREBASE_STORAGE_BUCKET=shopbook.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
4. You can also paste credentials directly inside the app by clicking **Cloud Live / Local Sync** in the header.

---

## 🌐 Deploy to Firebase Hosting (Free)

```bash
# 1. Build the production bundle
npm run build

# 2. Login to Firebase CLI
npx firebase login

# 3. Deploy
npx firebase deploy --only hosting
```

Your app will be live at `https://<your-project-id>.web.app`!

---

## 📱 Adding to Mobile Home Screen (App Icon)

Open your deployed URL or local server on mobile:
- **On Android (Chrome)**: Tap the install banner at the top or tap the 3 dots menu > **Install app** / **Add to Home Screen**.
- **On iPhone (Safari)**: Tap the **Share** button (box with upward arrow) > scroll down and tap **Add to Home Screen**.

The app icon with Majeed's Tea Stall kettle emblem will appear directly on your phone's home screen!
