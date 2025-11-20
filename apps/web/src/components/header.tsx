import { Crown } from "lucide-react";
import { Button } from "./ui/button";
import { UserButton } from "@clerk/tanstack-react-start";
import { New } from "./new";

export const Navbar = () => {
  return (
    <header className="bg-background">
      <div className="flex h-16 gap-4 px-8 items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-semibold">Informal </h1>
        </div>
        <div className="flex items-center space-x-4">
          <New />
          <Button size="sm">
            <Crown className="h-4 w-4 mr-1" />
            Upgrade
          </Button>
          <Button variant="ghost" size="icon">
            <UserButton />
          </Button>
        </div>
      </div>
    </header>
  );
};
