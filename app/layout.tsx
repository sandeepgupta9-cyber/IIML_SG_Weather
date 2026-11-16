import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "WeatherNow — Weather & Explore",
  description: "Weather forecasts, local time and weather-aware travel ideas."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}