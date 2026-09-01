import { redirect } from "next/navigation";

// No home screen yet — send visitors straight to the first real screen.
export default function Home() {
  redirect("/screen1");
}
