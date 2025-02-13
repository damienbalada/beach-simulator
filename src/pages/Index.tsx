
import { Button } from "@/components/ui/button";
import IsometricGame from "@/components/IsometricGame";

export default function Index() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-4">SimVille Isométrique</h1>
        <div className="h-[800px] bg-white rounded-lg shadow-lg overflow-hidden">
          <IsometricGame />
        </div>
      </div>
    </main>
  );
}
