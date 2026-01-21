
"use server";
import { getPersonalizedFoodRecommendations as getRecs, PersonalizedFoodRecommendationsInput, PersonalizedFoodRecommendationsOutput } from "@/ai/flows/personalized-food-recommendations";
import { 
    generateMenuItemImage as generateImage, 
    GenerateMenuItemImageInput, 
    GenerateMenuItemImageOutput 
} from "@/ai/flows/generate-menu-item-image";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, writeBatch, collection } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";
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


// Add the new action
interface RegisterSchoolResult {
    success: boolean;
    error?: string;
}

interface RegisterSchoolInput {
    schoolName: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
}

export async function registerSchoolAndAdmin(input: RegisterSchoolInput): Promise<RegisterSchoolResult> {
    const { schoolName, adminName, adminEmail, adminPassword } = input;
    
    const tempApp = initializeApp(firebaseConfig, `school-registration-${Date.now()}`);
    const tempAuth = getAuth(tempApp);
    const tempFirestore = getFirestore(tempApp);
    
    try {
        const userCredential = await createUserWithEmailAndPassword(tempAuth, adminEmail, adminPassword);
        const adminUser = userCredential.user;

        const batch = writeBatch(tempFirestore);

        const schoolRef = doc(collection(tempFirestore, 'schools'));
        const newSchool: School = {
            id: schoolRef.id,
            name: schoolName,
            createdAt: new Date().toISOString(),
        };
        batch.set(schoolRef, newSchool);

        const userRef = doc(tempFirestore, 'users', adminUser.uid);
        const newUser: Omit<User, 'childIds' | 'dailyLimit' | 'parentId'> = {
            id: adminUser.uid,
            name: adminName,
            email: adminEmail,
            role: 'Admin',
            schoolId: schoolRef.id,
            avatarUrl: `https://i.pravatar.cc/150?u=${adminUser.uid}`,
            balance: 0,
        };
        batch.set(userRef, newUser);

        await batch.commit();

        return { success: true };

    } catch (error: any) {
        console.error("School registration failed:", error);
        let errorMessage = "An unexpected error occurred.";
        if (error.code) {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = "This email address is already registered.";
                    break;
                case 'auth/weak-password':
                    errorMessage = "The password is too weak. Please use at least 6 characters.";
                    break;
                default:
                    errorMessage = error.message;
            }
        }
        return { success: false, error: errorMessage };
    }
}
