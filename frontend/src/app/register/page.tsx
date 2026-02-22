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
import { Loader2, Zap, Mail, Lock, User, ArrowRight } from "lucide-react";

const registerSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: "", email: "", password: "" },
    });

    const onSubmit = async (data: RegisterValues) => {
        setIsLoading(true);
        try {
            const response = await api.post("/auth/register", data);
            login(response.data);
            toast.success("Account created! Welcome to TaskFlow 🎉");
            router.push("/dashboard");
        } catch (error: any) {
            if (error.response?.data?.fieldErrors) {
                Object.keys(error.response.data.fieldErrors).forEach((key) => {
                    form.setError(key as keyof RegisterValues, {
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
                <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10" />
                <div className="absolute bottom-24 -left-16 w-64 h-64 rounded-full bg-white/[0.07]" />

                <div className="relative flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">TaskFlow</span>
                </div>

                <div className="relative space-y-4">
                    <div className="flex items-start gap-3 bg-white/10 rounded-xl p-4">
                        <div className="w-2 h-2 rounded-full bg-white/60 mt-1.5 flex-shrink-0" />
                        <p className="text-white/90 text-sm">JWT-secured authentication with HttpOnly cookies</p>
                    </div>
                    <div className="flex items-start gap-3 bg-white/10 rounded-xl p-4">
                        <div className="w-2 h-2 rounded-full bg-white/60 mt-1.5 flex-shrink-0" />
                        <p className="text-white/90 text-sm">Full task CRUD with search, filters, and pagination</p>
                    </div>
                    <div className="flex items-start gap-3 bg-white/10 rounded-xl p-4">
                        <div className="w-2 h-2 rounded-full bg-white/60 mt-1.5 flex-shrink-0" />
                        <p className="text-white/90 text-sm">Production-ready architecture with modular code</p>
                    </div>
                </div>

                <div className="relative text-white/50 text-sm">
                    © 2026 TaskFlow. All rights reserved.
                </div>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    <div className="lg:hidden flex items-center gap-2 mb-10">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" fill="white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight gradient-text">TaskFlow</span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-foreground">Create an account</h1>
                        <p className="text-muted-foreground mt-1.5 text-sm">Start managing your tasks for free</p>
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    className="pl-9 h-10 border-border focus:border-primary/60 transition-all"
                                    {...form.register("name")}
                                />
                            </div>
                            {form.formState.errors.name && (
                                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="pl-9 h-10 border-border focus:border-primary/60 transition-all"
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
                                    placeholder="Min. 6 characters"
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
                            className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all mt-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>Create Account <ArrowRight className="w-4 h-4 ml-1.5" /></>
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
