import Link from "next/link";
import { ShellLogo } from "@/components/shell/ShellLogo";
import { site } from "@/content/site";

export const metadata = { title: `Lost the path — ${site.displayName}` };

export default function NotFound() {
  return (
    <main id="main" className="notfound">
      <ShellLogo size={72} />
      <h1>This path leads nowhere.</h1>
      <p>
        {site.tortoiseName} is just as confused.
      </p>
      <Link href="/" className="static-btn">
        Back to the start
      </Link>
    </main>
  );
}
