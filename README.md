# 🚀 TuckshopKonnect - Launch Guide

A modern, multi-tenant, cashless solution for school tuckshops.

## 🌍 HOW TO GET YOUR PUBLIC LINK (GO LIVE)

To share this project with the world, follow these 3 steps:

1. **GitHub**: Click the **"Push to GitHub"** button in this Studio.
2. **App Hosting**: 
   - Go to your [Firebase Console](https://console.firebase.google.com/).
   - Select **App Hosting** from the left menu.
   - Click "Get Started" and connect the GitHub repository you just created.
3. **Database Setup**:
   - Enable **Authentication** (Email/Password).
   - Create a **Firestore** database in **Production Mode**.
   - Copy your `firebaseConfig` from Project Settings -> General -> Your Apps.
   - Paste it into `src/firebase/config.ts` and push to GitHub again.

**Your public link will be generated automatically by Firebase App Hosting!**

---

## 🛠 Features
*   **Multi-Tenancy**: Dedicated space for every school.
*   **Cashless**: Wallet funding via Paystack.
*   **Security**: Role-based access for Admins, Parents, and Students.
*   **AI Insights**: Personalized food recommendations.

## 💰 Billing Note
If you see error `[OR_BACR2_46]` during billing setup, contact your bank to allow "Google Services" international transactions, or try a different card.

## 📄 License
Production of Seme Productions. All rights reserved.
