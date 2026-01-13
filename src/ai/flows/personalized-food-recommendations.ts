'use server';
/**
 * @fileOverview This file defines a Genkit flow for providing personalized food recommendations to students.
 *
 * The flow takes into account past orders and dietary restrictions to suggest appealing menu items.
 *
 * - `getPersonalizedFoodRecommendations` - The main function to trigger the recommendation flow.
 * - `PersonalizedFoodRecommendationsInput` - The input type for the `getPersonalizedFoodRecommendations` function.
 * - `PersonalizedFoodRecommendationsOutput` - The output type for the `getPersonalizedFoodRecommendations` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedFoodRecommendationsInputSchema = z.object({
  orderHistory: z
    .array(z.string())
    .describe('List of past food orders (names of items).'),
  dietaryRestrictions: z
    .string()
    .optional()
    .describe('Any dietary restrictions the student has (e.g., vegetarian, gluten-free).'),
});
export type PersonalizedFoodRecommendationsInput = z.infer<
  typeof PersonalizedFoodRecommendationsInputSchema
>;

const PersonalizedFoodRecommendationsOutputSchema = z.object({
  recommendedItems: z
    .array(z.string())
    .describe('A list of recommended food items based on order history and dietary restrictions.'),
  reasoning:
    z.string()
      .describe('Explanation of why these items were recommended.'),
});
export type PersonalizedFoodRecommendationsOutput = z.infer<
  typeof PersonalizedFoodRecommendationsOutputSchema
>;

export async function getPersonalizedFoodRecommendations(
  input: PersonalizedFoodRecommendationsInput
): Promise<PersonalizedFoodRecommendationsOutput> {
  return personalizedFoodRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedFoodRecommendationsPrompt',
  input: {schema: PersonalizedFoodRecommendationsInputSchema},
  output: {schema: PersonalizedFoodRecommendationsOutputSchema},
  prompt: `You are a tuckshop assistant providing personalized food recommendations to students.

  Based on their order history and any dietary restrictions, suggest a few items from the menu that they might like.

  Order History: {{#if orderHistory}}{{{orderHistory}}}{{else}}No previous orders{{/if}}
  Dietary Restrictions: {{#if dietaryRestrictions}}{{{dietaryRestrictions}}}{{else}}None{{/if}}

  Consider these factors when making your recommendations. Return the list of food items in the recommendedItems field and the reasoning in the reasoning field.
  Menu: Sandwiches, Salads, Pies, Sausage Rolls, Fruit, Crisps, Chocolate Bars, Cookies, Water, Juice, Soda.
  `,
});

const personalizedFoodRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedFoodRecommendationsFlow',
    inputSchema: PersonalizedFoodRecommendationsInputSchema,
    outputSchema: PersonalizedFoodRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
