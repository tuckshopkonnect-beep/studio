
"use server";
import { getPersonalizedFoodRecommendations as getRecs, PersonalizedFoodRecommendationsInput, PersonalizedFoodRecommendationsOutput } from "@/ai/flows/personalized-food-recommendations";
import { 
    generateMenuItemImage as generateImage, 
    GenerateMenuItemImageInput, 
    GenerateMenuItemImageOutput 
} from "@/ai/flows/generate-menu-item-image";

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
