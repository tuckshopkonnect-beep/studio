# TuckshopKonnect

A modern, multi-tenant, cashless solution for school tuckshops.

## 🚀 Quick Start & Deployment Guide

To get your own version of TuckshopKonnect live, follow these steps:

### 1. Firebase Project Setup
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **Add project** and follow the prompts.
3.  **Enable Authentication**: Go to "Authentication" -> "Get Started" -> Enable "Email/Password".
4.  **Enable Firestore**: Go to "Cloud Firestore" -> "Create database" -> Start in **Production Mode** (rules are handled by `firestore.rules`). Choose a location near your users.
5.  **Enable App Hosting**: Go to "App Hosting" in the left sidebar and click "Get Started".

### 2. Configure Your App
1.  In the Firebase Console, go to **Project Settings** (gear icon).
2.  Under "Your apps", click the **Web icon (</>)** to register a new web app.
3.  Copy the `firebaseConfig` object provided.
4.  Open `src/firebase/config.ts` in your code and replace the placeholder values with your actual keys.

### 3. Publishing (Firebase App Hosting)
The easiest way to publish is via GitHub integration:
1.  Push your code to a **GitHub repository**.
2.  In the Firebase Console under **App Hosting**, click "New Backend".
3.  Connect your GitHub account and select your repository.
4.  Firebase will automatically detect the Next.js setup and build/deploy your site every time you push to the main branch.

### 4. Setting up the System Owner (IMPORTANT)
**Note on Data:** When you move to a new Firebase project, your database will be empty.
1.  Once your site is live at its new URL, navigate to: `your-site.com/portal/admin/signup`.
2.  Create your first account. This account will automatically have the **Admin** role.
3.  Login via the **Super Admin Login** at `/super/login`.
4.  From here, you can begin onboarding schools and creating their initial administrators.

---

## 💰 Estimated Costs (Firebase Blaze Plan)
For a typical school with ~500-1,000 active students:
- **Authentication**: $0 (Free up to 50,000 monthly active users).
- **Firestore Database**: $0 (Free up to 50,000 reads and 20,000 writes *per day*).
- **App Hosting / Cloud Functions**: $0 - $5 (Generous free tier for compute; you only pay for high traffic bandwidth).
- **Genkit (Gemini 2.5 Flash AI)**: $0 (Free tier available for standard usage).
- **Paystack**: No monthly fee. They only take a small percentage (approx. 1.5%) per successful payment.

**Total Estimated Cost: $0/month** for most users.

## 🛠 Features
- **Multi-tenancy**: Isolated data for different schools.
- **Cashless Ordering**: Real-time wallet tracking and Paystack integration.
- **Admin Dashboard**: Sales analytics, inventory, and user management.
- **Parental Controls**: Spending limits and real-time history.
- **AI Powered**: Personalized recommendations using Google Gemini.

## 📄 License
TuckshopKonnect is a production of Seme Productions. All rights reserved.
