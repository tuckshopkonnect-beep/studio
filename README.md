# 🚀 TuckshopKonnect - Launch Guide

A modern, multi-tenant, cashless solution for school tuckshops.

## 🌍 HOW TO GET YOUR PUBLIC LINK (GO LIVE)

If the Firebase Console is giving you errors, follow these 3 steps exactly:

1. **GitHub (Do this NOW)**: 
   - Click the **"Push to GitHub"** button in the top right of this Studio. 
   - This saves your code safely online.

2. **Database Setup (When billing is fixed)**:
   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Click **"Add Project"**.
   - Enable **Authentication** (Email/Password).
   - Create a **Firestore** database in **Production Mode**.
   - Select your "Web App" to get your `firebaseConfig` keys.

3. **App Hosting (The final link)**: 
   - In the Firebase Console, select **App Hosting** from the left menu.
   - Click **"Get Started"** and connect the GitHub repository you created in Step 1.
   - Paste your `firebaseConfig` keys into `src/firebase/config.ts` and push to GitHub again.

**Firebase will then generate your public link (e.g., `tuckshop-123.web.app`) automatically!**

---

## 🛠 Features
*   **Multi-Tenancy**: Dedicated space for every school.
*   **Cashless**: Wallet funding via Paystack.
*   **Security**: Role-based access for Admins, Parents, and Students.
*   **AI Insights**: Personalized food recommendations.

## 💰 Billing Troubleshooting [OR_BACR2_46]
- This error is a bank security check. 
- **Solution**: Use a card that supports "International Online Transactions" or call your bank to authorize "Google Services."

## 📄 License
Production of Seme Productions. All rights reserved.
