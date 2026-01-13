"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getPersonalizedFoodRecommendations } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Lightbulb, Zap, Loader2, Sparkles } from "lucide-react";
import type { PersonalizedFoodRecommendationsOutput } from "@/ai/flows/personalized-food-recommendations";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const dietaryOptions = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "gluten-free", label: "Gluten-Free" },
  { id: "nut-free", label: "Nut-Free" },
] as const;

const FormSchema = z.object({
  dietaryRestrictions: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof FormSchema>;

// Mock order history for demonstration purposes
const mockOrderHistory = ["Classic Sandwich", "Can of Soda", "Meat Pie", "Classic Sandwich"];

export default function RecommendationTool() {
  const [recommendations, setRecommendations] = useState<PersonalizedFoodRecommendationsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      dietaryRestrictions: [],
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setRecommendations(null);

    const input = {
      orderHistory: mockOrderHistory,
      dietaryRestrictions: data.dietaryRestrictions?.join(', ') || undefined,
    };

    const result = await getPersonalizedFoodRecommendations(input);
    setIsLoading(false);

    if (result.success && result.data) {
      setRecommendations(result.data);
    } else {
      toast({
        variant: "destructive",
        title: "Recommendation Error",
        description: result.error || "Could not fetch recommendations.",
      });
    }
  }

  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent rounded-full">
            <Lightbulb className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <CardTitle className="font-headline text-2xl">Personalized Recommendations</CardTitle>
            <CardDescription>Tell us your needs, and our AI will suggest something you'll love!</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="dietaryRestrictions"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Dietary Needs</FormLabel>
                      </div>
                      {dietaryOptions.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="dietaryRestrictions"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), item.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </FormItem>
                  )}
                />
                 <Button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</>
                  ) : (
                    <><Zap className="mr-2 h-4 w-4" /> Get Recommendations</>
                  )}
                </Button>
              </form>
            </Form>
          </div>
          <div className="flex items-center justify-center">
            {isLoading && (
              <div className="text-center text-muted-foreground">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <p className="mt-4">Our AI is thinking...</p>
              </div>
            )}
            {recommendations && (
              <Alert className="bg-primary/5 border-primary/20">
                <Sparkles className="h-4 w-4 !text-primary" />
                <AlertTitle className="text-primary font-bold">Here's what we suggest!</AlertTitle>
                <AlertDescription className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Recommended Items:</h4>
                    <ul className="list-disc pl-5">
                      {recommendations.recommendedItems.map(item => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                   <div>
                    <h4 className="font-semibold">Why you'll like it:</h4>
                    <p>{recommendations.reasoning}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            {!isLoading && !recommendations && (
              <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <p>Your recommendations will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
