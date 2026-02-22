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
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
            {/* Background gradient blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-purple-800/20 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
            </div>

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                    backgroundSize: "40px 40px",
                }}
            />

            <div className="relative z-10 w-full max-w-md px-4">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center glow-sm">
                            <Zap className="w-5 h-5 text-white" fill="white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight gradient-text">TaskFlow</span>
                    </div>
                </div>

                {/* Card */}
                <div className="glass rounded-2xl p-8 glow-purple">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Sign in to your workspace</p>
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-foreground/80">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="pl-9 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all"
                                    {...form.register("email")}
                                />
                            </div>
                            {form.formState.errors.email && (
                                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-foreground/80">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-9 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all"
                                    {...form.register("password")}
                                />
                            </div>
                            {form.formState.errors.password && (
                                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-2 bg-primary hover:bg-primary/90 text-white font-semibold h-11 rounded-xl transition-all duration-200 glow-sm hover:glow-purple"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    Sign In <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                                Create one free
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    Protected by industry-standard encryption
                </p>
            </div>
        </div>
    );
}
