import "./globals.css";

import { Barlow_Condensed, Dancing_Script } from "next/font/google";

import BootStrapApp from "@/services/redux/BootstrapApp";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import LoginRequiredPrompt from "@/components/auth/LoginRequiredPrompt";
import StoreProvider from "@/services/redux/StoreProvider";
import { ToastContainer } from "react-toastify";

const dancingscript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin", "vietnamese"],
  variable: "--font-barlow-condensed",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata = {
  title: "Store Shoes",
  description: "Cửa hàng bán giày thể thao",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${barlowCondensed.variable}
         ${dancingscript.variable} antialiased`}
      >
        <ErrorBoundary>
          <StoreProvider>
            <div className=" font-barlow">{children}</div>
            <LoginRequiredPrompt />
            <BootStrapApp />
            <ToastContainer />
          </StoreProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
