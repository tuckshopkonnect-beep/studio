
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

const colors = [
  { name: "Default", hsl: "262 52% 47%" },
  { name: "Stone", hsl: "25 51% 47%" },
  { name: "Red", hsl: "0 52% 47%" },
  { name: "Green", hsl: "142 52% 47%" },
  { name: "Blue", hsl: "217 52% 47%" },
];

export default function AppearancePage() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("light");
  const [primaryColor, setPrimaryColor] = useState("262 52% 47%");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    const storedColor = localStorage.getItem("primaryColor") || "262 52% 47%";
    
    setTheme(storedTheme);
    setPrimaryColor(storedColor);
    
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.style.setProperty("--primary", storedColor);

    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
     if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleColorChange = (hsl: string) => {
    setPrimaryColor(hsl);
    localStorage.setItem("primaryColor", hsl);
    document.documentElement.style.setProperty("--primary", hsl);
  };
  
  if (!mounted) {
    return null; // or a loading skeleton
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => handleThemeChange("light")}
              >
                <Sun className="mr-2" /> Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => handleThemeChange("dark")}
              >
                <Moon className="mr-2" /> Dark
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Accent Color</Label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <Button
                  key={color.name}
                  variant="outline"
                  className={cn(
                    "justify-start",
                    primaryColor === color.hsl && "border-2 border-primary"
                  )}
                  onClick={() => handleColorChange(color.hsl)}
                >
                  <span
                    className="mr-2 h-5 w-5 rounded-full"
                    style={{ backgroundColor: `hsl(${color.hsl})` }}
                  />
                  {color.name}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-4 rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold">Preview</h3>
            <div className="space-y-4">
                <p className="text-card-foreground">This is how your theme will look.</p>
                <div className="flex gap-4">
                    <Button>Primary Button</Button>
                    <Button variant="secondary">Secondary Button</Button>
                </div>
                <div className="w-full h-2 rounded-full bg-primary mt-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
