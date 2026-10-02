import { notFound } from "next/navigation";
import { Lab } from "./Lab";

// Dev-only playground for the world layers (P04). 404s in production.
export default function WorldLabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Lab />;
}
