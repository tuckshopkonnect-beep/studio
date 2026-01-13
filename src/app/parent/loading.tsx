import { Loader2 } from "lucide-react";

export default function ParentLoading() {
  return (
    <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
