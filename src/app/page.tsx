"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUser, login as apiLogin, verifyOTP } from "@/utils/api"; // Add login to api.ts
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Add tabs: npx shadcn-ui@latest add tabs
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const signupSchema = z.object({
   username: z.string().min(3, "Username must be at least 3 characters"),
   email: z.string().email("Invalid email address"),
   password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
   email: z.string().email("Invalid email address"),
   password: z.string().min(6, "Password must be at least 6 characters"),
});

const verifySchema = z.object({
   email: z.string().email("Invalid email address"),
   otp: z.string().length(6, "OTP must be 6 digits"),
});

type SignupFormData = z.infer<typeof signupSchema>;
type LoginFormData = z.infer<typeof loginSchema>;
type VerifyFormData = z.infer<typeof verifySchema>;

export default function Home() {
   const [userId, setUserId] = useState<string | null>(null);
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState<string | null>(null);
   const [token, setToken] = useState<string | null>(null);
   const [showVerify, setShowVerify] = useState(false);
   const router = useRouter();

   const signupForm = useForm<SignupFormData>({
      resolver: zodResolver(signupSchema),
      defaultValues: { username: "", email: "", password: "" },
   });

   const loginForm = useForm<LoginFormData>({
      resolver: zodResolver(loginSchema),
      defaultValues: { email: "", password: "" },
   });

   const verifyForm = useForm<VerifyFormData>({
      resolver: zodResolver(verifySchema),
      defaultValues: { email: "", otp: "" },
   });

   const onSignup = async (data: SignupFormData) => {
      try {
         const response = await createUser(data);
         if (response.status === "success") {
            setUserId(response.data!.user.id);
            setShowVerify(true);
            setSuccess("Sign-up successful. Check your email for OTP.");
            setError(null);
            router.replace("/chat");
         } else {
            setError(response.message || "Failed to sign up");
         }
      } catch (err) {
         setError("Error signing up");
      }
   };

   const onVerify = async (data: VerifyFormData) => {
      try {
         const response = await verifyOTP(data); // Add verifyOTP to api.ts
         if (response.status === "success") {
            setSuccess("Account verified. You can now log in.");
            setShowVerify(false);
            setError(null);
         } else {
            setError(response.message || "Failed to verify");
         }
      } catch (err) {
         setError("Error verifying OTP");
      }
   };

   const onLogin = async (data: LoginFormData) => {
      try {
         const response = await apiLogin(data);
         if (response.status === "success") {
            setToken(response.data!.token);
            localStorage.setItem("token", response.data!.token);
            setSuccess("Login successful");
            setError(null);
            router.replace("/chat");

            // Redirect to chat or dashboard
         } else {
            setError(response.message || "Failed to login");
         }
      } catch (err) {
         setError("Error logging in");
      }
   };

   return (
      <div className="container mx-auto p-4">
         <h1 className="text-2xl font-bold mb-4">User Authentication</h1>

         <Tabs defaultValue="signup">
            <TabsList>
               <TabsTrigger value="signup">Sign Up</TabsTrigger>
               <TabsTrigger value="login">Login</TabsTrigger>
            </TabsList>

            <TabsContent value="signup">
               <Form {...signupForm}>
                  <form
                     onSubmit={signupForm.handleSubmit(onSignup)}
                     className="space-y-4"
                  >
                     <FormField
                        control={signupForm.control}
                        name="username"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                 <Input {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={signupForm.control}
                        name="email"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                 <Input {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={signupForm.control}
                        name="password"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                 <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <Button type="submit">Sign Up</Button>
                  </form>
               </Form>

               {showVerify && (
                  <Form {...verifyForm}>
                     <form
                        onSubmit={verifyForm.handleSubmit(onVerify)}
                        className="space-y-4 mt-4"
                     >
                        <FormField
                           control={verifyForm.control}
                           name="email"
                           render={({ field }) => (
                              <FormItem>
                                 <FormLabel>Email</FormLabel>
                                 <FormControl>
                                    <Input {...field} />
                                 </FormControl>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                        <FormField
                           control={verifyForm.control}
                           name="otp"
                           render={({ field }) => (
                              <FormItem>
                                 <FormLabel>OTP</FormLabel>
                                 <FormControl>
                                    <Input {...field} />
                                 </FormControl>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                        <Button type="submit">Verify OTP</Button>
                     </form>
                  </Form>
               )}
            </TabsContent>

            <TabsContent value="login">
               <Form {...loginForm}>
                  <form
                     onSubmit={loginForm.handleSubmit(onLogin)}
                     className="space-y-4"
                  >
                     <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                 <Input {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                 <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <Button type="submit">Login</Button>
                  </form>
               </Form>
            </TabsContent>
         </Tabs>

         {error && (
            <Alert variant="destructive" className="mt-4">
               <AlertCircle className="h-4 w-4" />
               <AlertTitle>Error</AlertTitle>
               <AlertDescription>{error}</AlertDescription>
            </Alert>
         )}

         {success && (
            <Alert variant="default" className="mt-4">
               <AlertTitle>Success</AlertTitle>
               <AlertDescription>{success}</AlertDescription>
            </Alert>
         )}

         {token && (
            <p className="mt-4">
               Logged in! Token: {token.substring(0, 20)}... Use for chat.
            </p>
         )}
      </div>
   );
}
