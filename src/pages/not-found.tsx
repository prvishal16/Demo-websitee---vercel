import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center">
        <div className="font-display text-9xl font-bold" style={{ color: "hsl(38 65% 57% / 0.15)" }}>404</div>
        <h1 className="font-display text-3xl text-foreground mb-4 -mt-4">Page not found</h1>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
        <Link href="/">
          <button className="bg-amber text-black px-8 py-3 rounded-full font-medium hover:bg-amber/90 transition-all">
            Go Home
          </button>
        </Link>
      </div>
    </div>
  );
}
