import { ImageResponse } from "next/og";
import { AppIconMark } from "@/lib/appIcon";

const SIZE = { width: 512, height: 512 };

export async function GET() {
  return new ImageResponse(<AppIconMark size={512} />, SIZE);
}
