"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, User, Mail, Lock, Shield, CheckCircle2 } from "lucide-react";

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
});

const passwordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
    const { user, login } = useAuth();
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const profileForm = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
    });

    const passwordForm = useForm<PasswordValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    const onProfileSubmit = async (data: ProfileValues) => {
        setProfileLoading(true);
        try {
            const res = await api.put("/users/me", data);
            login(res.data); // update AuthContext with new name/email
            toast.success("Profile updated successfully");
        } catch (error: any) {
            if (error.response?.data?.fieldErrors) {
                Object.keys(error.response.data.fieldErrors).forEach((key) => {
                    profileForm.setError(key as keyof ProfileValues, {
                        message: error.response.data.fieldErrors[key],
                    });
                });
            } else {
                toast.error(error.response?.data?.message || "Failed to update profile");
            }
        } finally {
            setProfileLoading(false);
        }
    };

    const onPasswordSubmit = async (data: PasswordValues) => {
        setPasswordLoading(true);
        try {
            await api.put("/users/me", { password: data.password });
            toast.success("Password changed successfully");
            passwordForm.reset();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setPasswordLoading(false);
        }
    };

    const initials = user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="max-w-2xl space-y-8">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
                <p className="text-muted-foreground text-sm mt-1">Manage your account details and security</p>
            </div>

            {/* Avatar section */}
            <div className="flex items-center gap-5 p-5 rounded-xl border border-border bg-card shadow-card">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                    {initials}
                </div>
                <div>
                    <p className="font-semibold text-foreground">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs text-emerald-600 font-medium">Active account</span>
                    </div>
                </div>
            </div>

            {/* Profile Info Form */}
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold text-foreground">Personal Information</h2>
                </div>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="p-5 space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Your full name"
                                className="pl-9 h-10 border-border bg-background"
                                {...profileForm.register("name")}
                            />
                        </div>
                        {profileForm.formState.errors.name && (
                            <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="email"
                                placeholder="you@example.com"
                                className="pl-9 h-10 border-border bg-background"
                                {...profileForm.register("email")}
                            />
                        </div>
                        {profileForm.formState.errors.email && (
                            <p className="text-xs text-destructive">{profileForm.formState.errors.email.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end pt-1">
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary/90 text-white h-9 px-5 text-sm font-semibold"
                            disabled={profileLoading}
                        >
                            {profileLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Change Password Form */}
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold text-foreground">Change Password</h2>
                </div>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="p-5 space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="password"
                                placeholder="Min. 6 characters"
                                className="pl-9 h-10 border-border bg-background"
                                {...passwordForm.register("password")}
                            />
                        </div>
                        {passwordForm.formState.errors.password && (
                            <p className="text-xs text-destructive">{passwordForm.formState.errors.password.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Confirm New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="password"
                                placeholder="Repeat password"
                                className="pl-9 h-10 border-border bg-background"
                                {...passwordForm.register("confirmPassword")}
                            />
                        </div>
                        {passwordForm.formState.errors.confirmPassword && (
                            <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end pt-1">
                        <Button
                            type="submit"
                            variant="outline"
                            className="h-9 px-5 text-sm font-semibold border-border"
                            disabled={passwordLoading}
                        >
                            {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Security note */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                <Shield className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Your password is hashed with <strong>bcrypt</strong> and never stored in plain text.
                    Sessions are managed via secure <strong>HttpOnly cookies</strong> that are inaccessible to JavaScript.
                </p>
            </div>
        </div>
    );
}
