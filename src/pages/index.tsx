import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <main className="flex flex-col max-w-7xl mx-auto py-8">
      <div className="flex justify-between pb-2">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Jobs on Farcaster
        </h1>

        <Badge variant="secondary" className="text-3xl">
          1,201 Jobs
        </Badge>
      </div>

      <hr />
    </main>
  );
}
