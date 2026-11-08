import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
    title: "NEXUS Fleet | Управление каршерингом",
    description: "Система управления парком каршеринга",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru">
        <body className="bg-[#000000] text-[#F5F5F7] antialiased selection:bg-[#0A84FF]/30 selection:text-white">
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}