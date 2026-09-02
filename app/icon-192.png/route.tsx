import { ImageResponse } from "next/og";
import { AppIconMark } from "@/lib/appIcon";

const SIZE = { width: 192, height: 192 };

export async function GET() {
  return new ImageResponse(<AppIconMark size={192} />, SIZE);
}
