# TuckshopKonnect

A modern, multi-tenant, cashless solution for school tuckshops.

## 🚀 The Way Forward (Getting Live)

If you are seeing billing errors (like `[OR_BACR2_46]`), don't worry. This is a common Google security check. Here is your roadmap to success:

### 1. Resolve Billing & Setup
1.  **Google Cloud Billing**: If one card fails, try another. Ensure your address matches your bank statement exactly.
2.  **Enable Services**: In your [Firebase Console](https://console.firebase.google.com/):
    *   **Authentication**: Enable Email/Password.
    *   **Firestore**: Create a database in **Production Mode**.
    *   **App Hosting**: Connect your GitHub repository.

### 2. Connect Your Code
1.  Push your code to GitHub using the **"Push to GitHub"** button in this Studio.
2.  Once your Firebase Project is created, go to **Project Settings** (gear icon) -> **General**.
3.  Scroll down to "Your apps", click the **Web icon (</>)**, and register your app.
4.  Copy the `firebaseConfig` object and paste it into `src/firebase/config.ts` in your code.
5.  Push this change to GitHub to update your live site.

### 3. Initialize Your Live System
Once your site is live (e.g., `tuckshop-konnect.web.app`):
1.  Go to `your-site.com/portal/admin/signup`.
2.  Create your **System Owner** account.
3.  Login and go to `/super/dashboard` to start adding your schools!

---

## 🛠 Features
*   **Multi-Tenancy**: Separate data for every school.
*   **Cashless**: Wallet funding via Paystack.
*   **Security**: Role-based access for Admins, Parents, and Students.
*   **AI Insights**: Personalized food recommendations for students.

## 💰 Estimated Costs
*   **Firebase Free Tier**: Covers up to 50,000 users and daily database limits.
*   **App Hosting**: Generous free tier; usually $0 for medium-sized schools.

---

## 📄 License
TuckshopKonnect is a production of Seme Productions. All rights reserved.
