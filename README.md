# TuckshopKonnect

A modern, multi-tenant, cashless solution for school tuckshops.

## 🚀 Quick Start & Deployment Guide

To get your own version of TuckshopKonnect live, follow these steps:

### 1. GitHub Integration (The "Push" Step)
Since this is a Next.js project, your **index page** (the landing page) is automatically set to `src/app/page.tsx`. You don't need to configure this manually.

1.  Click the **"Push to GitHub"** button in the top toolbar of this Studio environment.
2.  Follow the prompts to create a new repository in your GitHub account.
3.  Once complete, all your code will be safely stored on GitHub.

### 2. Firebase Project Setup
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **Add project** and follow the prompts.
3.  **Enable Authentication**: Go to "Authentication" -> "Get Started" -> Enable "Email/Password".
4.  **Enable Firestore**: Go to "Cloud Firestore" -> "Create database" -> Start in **Production Mode**. 
5.  **Enable App Hosting**: Go to "App Hosting" in the left sidebar and click "Get Started". Connect it to the GitHub repository you created in Step 1.

### 3. Configure Your Credentials
1.  In the Firebase Console, go to **Project Settings** (gear icon).
2.  Under "Your apps", click the **Web icon (</>)** to register a new web app.
3.  Copy the `firebaseConfig` object provided.
4.  Open `src/firebase/config.ts` in your code and replace the values with your actual keys. **Push this change to GitHub** to trigger an automatic update of your live site.

### 4. Setting up the System Owner (IMPORTANT)
**Note on Data:** Your new live database will be empty.
1.  Once your site is live (e.g., `your-app.web.app`), navigate to: `your-site.com/portal/admin/signup`.
2.  Create your first account. This account will automatically have the **Admin** role and act as the "System Owner."
3.  Login via the **Super Admin Login** at `/super/login` to start adding schools.

---

## 💰 Estimated Costs (Firebase Blaze Plan)
For a typical school with ~500-1,000 active students:
- **Authentication**: $0 (Free up to 50,000 monthly active users).
- **Firestore Database**: $0 (Free up to 50,000 reads and 20,000 writes *per day*).
- **App Hosting**: $0 - $5 (Generous free tier for compute).
- **Genkit (Gemini 2.5 Flash AI)**: $0 (Free tier available).

**Total Estimated Cost: $0/month** for most users.

## 🛠 Features
- **Multi-tenancy**: Isolated data for different schools.
- **Cashless Ordering**: Real-time wallet tracking and Paystack integration.
- **Admin Dashboard**: Sales analytics, inventory, and user management.
- **Parental Controls**: Spending limits and real-time history.
- **AI Powered**: Personalized recommendations using Google Gemini.

## 📄 License
TuckshopKonnect is a production of Seme Productions. All rights reserved.
