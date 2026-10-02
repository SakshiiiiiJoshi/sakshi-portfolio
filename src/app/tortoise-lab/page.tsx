import { notFound } from "next/navigation";
import { Lab } from "./Lab";

// Dev-only playground for the tortoise (P03). 404s in production.
export default function TortoiseLabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Lab />;
}
