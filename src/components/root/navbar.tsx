import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "../ui/sheet";

export const Navbar: React.FC = () => {
  return (
    <div className="h-20 border-b flex items-center px-4 md:px-16">
      <DesktopNav />
      <MobileNav />
    </div>
  );
};

const DesktopNav: React.FC = () => {
  return (
    <div className="hidden md:flex w-full justify-between">
      <span className="text-3xl font-medium">🌐 JobsCaster</span>

      <div className="flex items-center gap-8">
        <Button>🌟 Post a Job</Button>
        <Button variant="outline">🤔 FAQ</Button>
      </div>
    </div>
  );
};

const MobileNav: React.FC = () => {
  return (
    <div className="block md:hidden">
      <Sheet>
        <SheetTrigger>
          <HamburgerMenuIcon className="h-8 w-8" />
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col items-start">
          <SheetHeader>
            <span className="text-3xl font-medium">🌐 JobsCaster</span>
          </SheetHeader>
          <div className="flex flex-col gap-6 w-full">
            <Button>🌟 Post a Job</Button>
            <Button variant="outline">🤔 FAQ</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
