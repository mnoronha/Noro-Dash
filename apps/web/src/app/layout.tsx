import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noro Dash",
  description: "Dashboard all-in-one para agencias de trafego pago.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
