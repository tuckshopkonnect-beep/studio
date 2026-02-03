# TuckshopKonnect

A modern, cashless solution for school tuckshops.

## Features
- **Multi-tenancy**: Support for multiple schools within one platform.
- **Cashless Ordering**: Students fund wallets via Paystack and order online.
- **Admin Dashboard**: Real-time sales tracking, inventory management, and user control.
- **Parental Controls**: Daily spending limits and transaction history.
- **AI Powered**: Personalized food recommendations and AI-generated menu images.

## System Owner (Super Admin)
The **Super Admin Console** is used to onboard new schools and manage the global network.
- **Path**: `/super/dashboard`
- **Actions**: Register new schools, provision first administrators, and view global system health.

## Deployment & Estimated Costs
This project is built to run on **Firebase App Hosting**.

### Monthly Cost Estimate (Firebase Blaze Plan)
For a typical school with ~500-1,000 active students:
- **Authentication**: $0 (Free up to 50,000 monthly active users).
- **Firestore Database**: $0 (Free up to 50,000 reads and 20,000 writes *per day*).
- **App Hosting / Cloud Functions**: $0 - $5 (Generous free tier for compute; you only pay for high traffic bandwidth).
- **Genkit (Gemini 2.5 Flash AI)**: $0 (Free tier available for standard usage).
- **Paystack**: No monthly fee. They only take a small percentage (approx. 1.5%) per successful payment.

**Total Estimated Cost: $0/month** for most users. As your school grows to thousands of daily orders, you might see small charges between $5 and $15 for database operations and bandwidth.

## Setup
1. Configure your Firebase Project in `src/firebase/config.ts`.
2. Set up your Paystack public key in `src/components/FundWalletDialog.tsx`.
3. Deploy using the Firebase CLI: `firebase deploy`.
