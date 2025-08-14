"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { validateToken } from "@/utils/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   const router = useRouter();
   const pathname = usePathname();
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const checkToken = async () => {
         const token = localStorage.getItem("token");
         if (!token) {
            if (pathname !== "/") {
               router.push("/");
            }
            setIsLoading(false);
            return;
         }

         try {
            const response = await validateToken(token);
            if (response.status === "success") {
               if (pathname === "/") {
                  router.push("/chats");
               }
            } else {
               localStorage.removeItem("token");
               setError(response.message || "Invalid token");
               if (pathname !== "/") {
                  router.push("/");
               }
            }
         } catch (err: any) {
            const message =
               err.response?.data?.message || "Error validating token";
            const code = err.response?.data?.error?.code;
            if (code === 1002 || code === 1001 || code === 1000) {
               localStorage.removeItem("token");
               setError(message);
               if (pathname !== "/") {
                  router.push("/");
               }
            } else {
               setError("Error validating token");
            }
         } finally {
            setIsLoading(false);
         }
      };

      checkToken();
   }, [router, pathname]);

   if (isLoading) {
      return (
         <html lang="en">
            <body className={inter.className}>
               <div className="flex justify-center items-center h-screen">
                  Loading...
               </div>
               ;
            </body>
         </html>
      );
   }

   return (
      <html lang="en">
         <body className={inter.className}>
            {error && (
               <Alert variant="destructive" className="m-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
               </Alert>
            )}
            {children}
         </body>
      </html>
   );
}
