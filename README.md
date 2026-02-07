# TuckshopKonnect

A modern, multi-tenant, cashless solution for school tuckshops.

## 🚀 Deployment Guide (Going Live)

**IMPORTANT:** This app uses Next.js features (Server Actions, AI, and dynamic routing) that require a server. **Do not use GitHub Pages** to host this site, as it will not work. You must use **Firebase App Hosting**.

### 1. Store your code on GitHub (Storage)
1.  Click the **"Push to GitHub"** button in the top toolbar of this Studio environment.
2.  Follow the prompts to create a new repository (e.g., `tuckshop-konnect`).
3.  **Note:** GitHub is for *storing* your code. If you see a `github.io` link in your GitHub settings, you can ignore it; that is not where your app will live.

### 2. Firebase Project Setup
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **Add project** and follow the prompts.
3.  **Enable Authentication**: Go to "Authentication" -> "Get Started" -> Enable "Email/Password".
4.  **Enable Firestore**: Go to "Cloud Firestore" -> "Create database" -> Start in **Production Mode**. 

### 3. Connect to App Hosting (Hosting)
1.  In the Firebase Console left sidebar, click **App Hosting**.
2.  Click **Get Started** and connect it to the GitHub repository you created in Step 1.
3.  Firebase will automatically detect that this is a Next.js project. It will handle the "index" page (`src/app/page.tsx`) automatically.
4.  Once the build is complete, Firebase will provide you with a live URL (e.g., `your-app.web.app`). **This is your live site.**

### 4. Configure Your Credentials
1.  In the Firebase Console, go to **Project Settings** (gear icon).
2.  Under "Your apps", click the **Web icon (</>)** to register a new web app.
3.  Copy the `firebaseConfig` object provided.
4.  Open `src/firebase/config.ts` in your code and replace the values with your actual keys. 
5.  **Push this change to GitHub** to trigger an automatic update of your live site.

---

## 🛠 Features & Hidden Paths
- **Index Page**: Automatically set to the landing page.
- **System Owner Setup**: Once live, go to `your-site.com/portal/admin/signup` to create the master account.
- **Super Admin Login**: Located at `/super/login` for global management.
- **Cashless Ordering**: Real-time wallet tracking and Paystack integration.
- **AI Powered**: Personalized recommendations using Google Gemini.

## 💰 Estimated Costs (Firebase Blaze Plan)
For a typical school with ~500-1,000 active students:
- **Authentication**: $0 (Free up to 50,000 monthly active users).
- **Firestore Database**: $0 (Free up to 50,000 reads and 20,000 writes *per day*).
- **App Hosting**: $0 - $5 (Generous free tier for compute).
- **Genkit (Gemini 2.5 Flash AI)**: $0 (Free tier available).

**Total Estimated Cost: $0/month** for most users.

## 📄 License
TuckshopKonnect is a production of Seme Productions. All rights reserved.
