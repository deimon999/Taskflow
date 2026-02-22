"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, Zap, Mail, Lock, ArrowRight } from "lucide-react";

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: LoginValues) => {
        setIsLoading(true);
        try {
            const response = await api.post("/auth/login", data);
            login(response.data);
            toast.success("Welcome back!");
            router.push("/dashboard");
        } catch (error: any) {
            if (error.response?.data?.fieldErrors) {
                Object.keys(error.response.data.fieldErrors).forEach((key) => {
                    form.setError(key as keyof LoginValues, {
                        type: "manual",
                        message: error.response.data.fieldErrors[key],
                    });
                });
            } else {
                toast.error(error.response?.data?.message || "Something went wrong.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-background">
            {/* Left panel — branding */}
            <div className="hidden lg:flex lg:w-[45%] bg-primary flex-col justify-between p-12 relative overflow-hidden">
                {/* Subtle pattern circles */}
                <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10" />
                <div className="absolute bottom-24 -left-16 w-64 h-64 rounded-full bg-white/[0.07]" />

                <div className="relative flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">TaskFlow</span>
                </div>

                <div className="relative">
                    <blockquote className="text-white/90 text-2xl font-medium leading-snug mb-6">
                        "The key is not to prioritize what's on your schedule, but to schedule your priorities."
                    </blockquote>
                    <p className="text-white/60 text-sm">— Stephen Covey</p>
                </div>

                <div className="relative text-white/50 text-sm">
                    © 2026 TaskFlow. All rights reserved.
                </div>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-10">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" fill="white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight gradient-text">TaskFlow</span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
                        <p className="text-muted-foreground mt-1.5 text-sm">Welcome back — enter your details to continue</p>
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="pl-9 h-10 border-border focus:border-primary/60 focus:ring-primary/20 transition-all"
                                    {...form.register("email")}
                                />
                            </div>
                            {form.formState.errors.email && (
                                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-9 h-10 border-border focus:border-primary/60 transition-all"
                                    {...form.register("password")}
                                />
                            </div>
                            {form.formState.errors.password && (
                                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>Continue <ArrowRight className="w-4 h-4 ml-1.5" /></>
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
