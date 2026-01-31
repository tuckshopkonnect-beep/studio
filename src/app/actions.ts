
"use server";
import { getPersonalizedFoodRecommendations as getRecs, PersonalizedFoodRecommendationsInput, PersonalizedFoodRecommendationsOutput } from "@/ai/flows/personalized-food-recommendations";
import { 
    generateMenuItemImage as generateImage, 
    GenerateMenuItemImageInput, 
    GenerateMenuItemImageOutput 
} from "@/ai/flows/generate-menu-item-image";
import { firebaseConfig } from "@/firebase/config";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, addDoc, collection } from "firebase/firestore";
import type { School, User } from "@/lib/data";

interface ActionResult {
    success: boolean;
    data?: PersonalizedFoodRecommendationsOutput;
    error?: string;
}

export async function getPersonalizedFoodRecommendations(input: PersonalizedFoodRecommendationsInput): Promise<ActionResult> {
    try {
        const result = await getRecs(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error getting personalized food recommendations:", error);
        // It's better to return a generic error message to the client
        return { success: false, error: "An unexpected error occurred while fetching recommendations." };
    }
}

interface ImageActionResult {
    success: boolean;
    data?: GenerateMenuItemImageOutput;
    error?: string;
}

export async function generateMenuItemImageAction(input: GenerateMenuItemImageInput): Promise<ImageActionResult> {
    try {
        const result = await generateImage(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error generating menu item image:", error);
        return { success: false, error: "An unexpected error occurred while generating the image." };
    }
}


interface CreateSchoolResult {
    success: boolean;
    error?: string;
}

export async function createSchoolAndAdmin(
    schoolName: string,
    adminName: string,
    adminEmail: string,
    adminPassword: string
): Promise<CreateSchoolResult> {
    
    // We need a separate app instance to create a user without signing out the current admin
    const tempApp = initializeApp(firebaseConfig, `create-school-admin-${Date.now()}`);
    const tempAuth = getAuth(tempApp);
    const firestore = getFirestore(tempApp);

    try {
        // 1. Create the new School document
        const schoolsCol = collection(firestore, "schools");
        const schoolDocRef = await addDoc(schoolsCol, { name: schoolName } as Omit<School, 'id'>);
        const schoolId = schoolDocRef.id;

        // 2. Create the admin user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(tempAuth, adminEmail, adminPassword);
        const newAdminUser = userCredential.user;

        // 3. Create the user document in Firestore
        const userDocRef = doc(firestore, "users", newAdminUser.uid);
        const adminProfile: User = {
            id: newAdminUser.uid,
            name: adminName,
            email: adminEmail,
            role: 'Admin',
            schoolId: schoolId,
            avatarUrl: `https://i.pravatar.cc/150?u=${newAdminUser.uid}`,
            balance: 0,
        };
        await setDoc(userDocRef, adminProfile);

        return { success: true };

    } catch (error: any) {
        console.error("Error during school and admin creation:", error);
        
        let errorMessage = "An unexpected error occurred.";
        if (error.code) {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = "This email address is already in use by another account.";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "The email address is not valid.";
                    break;
                case 'auth/weak-password':
                    errorMessage = "The password is too weak. It must be at least 6 characters long.";
                    break;
                case 'permission-denied':
                    errorMessage = "Permission denied. Make sure you are logged in as an administrator to perform this action.";
                    break;
                default:
                    errorMessage = error.message;
            }
        }
        return { success: false, error: errorMessage };
    }
}
