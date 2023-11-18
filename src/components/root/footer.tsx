import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <div className="flex items-center justify-center text-muted-foreground py-2 gap-1">
      <Link href="https://haardik.dev/" target="_blank" className="underline">
        <span>haardik.dev</span>
      </Link>
      |
      <Link
        href="https://github.com/OpenFarcaster"
        target="_blank"
        className="underline"
      >
        OpenFarcaster
      </Link>
    </div>
  );
};
