import Link from "next/link";
import { AlertCircle } from "lucide-react"

export default function NotFound({}) {
  return (
     <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <AlertCircle className="mx-auto mb-4 text-destructive" size={48} />
        <h1 className="text-4xl font-bold text-foreground mb-2">Not Found</h1>
        <p className="text-lg text-foreground/60 mb-8">The space you're looking for doesn't exist.</p>
        <Link
          href="/rooms"
          className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold"
        >
          Browse All Spaces
        </Link>
      </div>
    </div>
  );
}
