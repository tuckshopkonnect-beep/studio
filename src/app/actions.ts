
"use server";
import { getPersonalizedFoodRecommendations as getRecs, PersonalizedFoodRecommendationsInput, PersonalizedFoodRecommendationsOutput } from "@/ai/flows/personalized-food-recommendations";
import { 
    generateMenuItemImage as generateImage, 
    GenerateMenuItemImageInput, 
    GenerateMenuItemImageOutput 
} from "@/ai/flows/generate-menu-item-image";
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { FirebaseError } from 'firebase/app';


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

// Define input type for the new action
export interface RegisterSchoolInput {
    schoolName: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
}

interface RegisterSchoolResult {
    success: boolean;
    error?: string;
}

export async function registerSchoolAndAdmin(input: RegisterSchoolInput): Promise<RegisterSchoolResult> {
    // Use a temporary app instance to create the user without signing in on the server
    const tempApp = initializeApp(firebaseConfig, `school-registration-${Date.now()}`);
    const tempAuth = getAuth(tempApp);
    const firestore = getFirestore(tempApp);

    try {
        // 1. Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(tempAuth, input.adminEmail, input.adminPassword);
        const adminUser = userCredential.user;

        // 2. Use a batch write to create school and user doc atomically
        const batch = writeBatch(firestore);

        // 3. Create the School document
        const schoolRef = doc(collection(firestore, "schools"));
        batch.set(schoolRef, {
            id: schoolRef.id,
            name: input.schoolName,
            createdAt: serverTimestamp(),
        });

        // 4. Create the Admin User document
        const userRef = doc(firestore, "users", adminUser.uid);
        batch.set(userRef, {
            id: adminUser.uid,
            name: input.adminName,
            email: input.adminEmail,
            role: 'Admin',
            schoolId: schoolRef.id,
            avatarUrl: `https://i.pravatar.cc/150?u=${adminUser.uid}`,
            balance: 0,
        });

        // 5. Commit the batch
        await batch.commit();

        return { success: true };

    } catch (error: any) {
        console.error("School Registration Failed:", error);
        let description = "An unexpected error occurred. Please try again.";
        if (error instanceof FirebaseError) {
            if (error.code === 'auth/email-already-in-use') {
                description = "This email address is already registered. Please try signing in.";
            } else if (error.code === 'auth/weak-password') {
                description = "The password is too weak. It must be at least 6 characters long.";
            } else {
                description = error.message;
            }
        }
        return { success: false, error: description };
    }
}
