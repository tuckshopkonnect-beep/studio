
'use server';
/**
 * @fileOverview A Genkit flow for generating an image for a menu item.
 *
 * - generateMenuItemImage: A function that handles the image generation.
 * - GenerateMenuItemImageInput: The input type for the function.
 * - GenerateMenuItemImageOutput: The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateMenuItemImageInputSchema = z.object({
  itemName: z.string().describe('The name of the menu item to generate an image for.'),
});
export type GenerateMenuItemImageInput = z.infer<typeof GenerateMenuItemImageInputSchema>;

const GenerateMenuItemImageOutputSchema = z.object({
  imageUrl: z.string().describe('The generated image as a data URI.'),
});
export type GenerateMenuItemImageOutput = z.infer<typeof GenerateMenuItemImageOutputSchema>;

export async function generateMenuItemImage(input: GenerateMenuItemImageInput): Promise<GenerateMenuItemImageOutput> {
    return generateMenuItemImageFlow(input);
}

const generateMenuItemImageFlow = ai.defineFlow(
    {
        name: 'generateMenuItemImageFlow',
        inputSchema: GenerateMenuItemImageInputSchema,
        outputSchema: GenerateMenuItemImageOutputSchema,
    },
    async (input) => {
        const { media } = await ai.generate({
            model: 'googleai/imagen-4.0-fast-generate-001',
            prompt: `A professional, appetizing photo of "${input.itemName}", on a clean, simple, light-colored background, studio lighting. The food should look fresh and delicious. Suitable for a restaurant menu.`,
        });

        if (!media?.url) {
            throw new Error('Image generation failed to return an image.');
        }

        return { imageUrl: media.url };
    }
);
