import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Lock, Mail, Phone, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phoneNumber: z.string().regex(/^[6-9][0-9]{9}$/, "Please enter a valid 10-digit phone number starting with 6-9"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignUpValues = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SignUpValues) => {
    setIsLoading(true);
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(values),
      });

      // Check if OTP verification is required (default behavior for new OTP flow)
      if (data.requiresOtp) {
        toast.info("A verification code has been sent to your email.");
        navigate("/verify-otp", { state: { target: values.email } });
      } else if (data.jwtToken) {
        login(data.jwtToken, { 
          identifier: values.email, 
          name: data.name || values.name, 
          email: values.email,
          role: data.role || "USER"
        });
        toast.success("Welcome to Praisomart! Your account has been created.");
        navigate("/");
      } else {
        toast.success("Account created! Please verify your email with the OTP sent.");
        navigate("/verify-otp", { state: { target: values.email } });
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border rounded-3xl shadow-xl p-8 md:p-10 relative overflow-hidden">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-display font-bold mb-2">Create Account</h1>
              <p className="text-muted-foreground">Join the Praisomart community</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <label className="text-xs font-medium ml-1">Full Name</label>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input 
                              {...field}
                              type="text" 
                              placeholder="John Doe"
                              className="w-full pl-12 pr-4 py-3 rounded-2xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="ml-1 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <label className="text-xs font-medium ml-1">Email</label>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input 
                              {...field}
                              type="email" 
                              placeholder="john@example.com"
                              className="w-full pl-12 pr-4 py-3 rounded-2xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="ml-1 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <label className="text-xs font-medium ml-1">Phone Number</label>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input 
                              {...field}
                              type="tel" 
                              placeholder="+91 00000 00000"
                              className="w-full pl-12 pr-4 py-3 rounded-2xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="ml-1 text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <label className="text-xs font-medium ml-1">Password</label>
                          <FormControl>
                            <input 
                              {...field}
                              type="password" 
                              placeholder="••••••"
                              className="w-full px-4 py-3 rounded-2xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                            />
                          </FormControl>
                          <FormMessage className="ml-1 text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <label className="text-xs font-medium ml-1">Confirm</label>
                          <FormControl>
                            <input 
                              {...field}
                              type="password" 
                              placeholder="••••••"
                              className="w-full px-4 py-3 rounded-2xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                            />
                          </FormControl>
                          <FormMessage className="ml-1 text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 mt-4"
                >
                  {isLoading ? "Creating Account..." : "Sign Up"}
                  {!isLoading && <ArrowRight size={18} />}
                </button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account? {" "}
                <Link to="/signin" className="text-primary font-bold hover:underline">Sign in</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default SignUp;
