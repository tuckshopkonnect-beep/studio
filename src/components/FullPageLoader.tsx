
"use client";

import { Loader2, Utensils } from "lucide-react";
import { motion } from "framer-motion";

interface FullPageLoaderProps {
  message?: string;
}

export default function FullPageLoader({ message = "Loading TuckshopKonnect..." }: FullPageLoaderProps) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="mb-6 flex items-center justify-center rounded-full bg-primary/10 p-6"
      >
        <Utensils className="h-12 w-12 text-primary" />
      </motion.div>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg font-medium text-muted-foreground animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}
