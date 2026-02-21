import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  return (
    <div className="min-h-screen p-8 bg-background">
      {/* navbar */}
      <nav className="flex justify-between items-center p-4 mb-8 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="flex items-center justify-center w-9 h-9 bg-primary rounded-xl transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 shadow-sm">
            <Layers className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tighter">Flowboard</span>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Logout
          </Button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-10">
        <h1 className="text-4xl font-extrabold tracking-tight">
          My Workspaces
        </h1>
        <p className="text-muted-foreground mt-2">
          Select a Workspace or create a new one.
        </p>

        <div className="flex justify-between items-center mt-10">
          <div className="flex items-center gap-2">
            <Input className="max-w-xs" placeholder="Room Id..." />
            <Button type="button" variant="outline" className="cursor-pointer">
              Join Room
            </Button>
          </div>

          <Button type="button" className="cursor-pointer font-bold">
            + Create New
          </Button>
        </div>
      </main>
    </div>
  );
}