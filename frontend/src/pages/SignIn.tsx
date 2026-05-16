import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const signInSchema = z.object({
  identifier: z.string().min(1, "Email or phone is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInValues = z.infer<typeof signInSchema>;

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInValues) => {
    setIsLoading(true);

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });

      login(data.jwtToken || data.token, { 
        identifier: values.identifier, 
        name: data.name,
        email: values.identifier,
        role: data.role || "USER"
      });
      toast.success("Welcome back to Praisomart!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
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
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Sparkles size={100} className="text-primary" />
            </div>

            <div className="text-center mb-10">
              <h1 className="text-3xl font-display font-bold mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">Sign in to your Praisomart account</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <label className="text-sm font-medium ml-1">Email or Phone</label>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input 
                              {...field}
                              type="text" 
                              placeholder="Enter your email or phone"
                              className="w-full pl-12 pr-4 py-3 rounded-2xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="ml-1" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                          <label className="text-sm font-medium">Password</label>
                          <Link to="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input 
                              {...field}
                              type="password" 
                              placeholder="••••••••"
                              className="w-full pl-12 pr-4 py-3 rounded-2xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="ml-1" />
                      </FormItem>
                    )}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                  {!isLoading && <ArrowRight size={18} />}
                </button>
              </form>
            </Form>

            <div className="mt-8 text-center text-sm">
              <p className="text-muted-foreground">
                Don't have an account? {" "}
                <Link to="/signup" className="text-primary font-bold hover:underline">Sign up</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default SignIn;
