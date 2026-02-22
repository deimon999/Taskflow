"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { LogOut, LayoutDashboard, CheckSquare, Zap, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { logout, user } = useAuth();
    const pathname = usePathname();

    const navigation = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
    ];

    const initials = user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-background">
                {/* Sidebar */}
                <aside className="hidden w-60 flex-col sm:flex border-r border-white/[0.06] bg-card/50 backdrop-blur-sm relative overflow-hidden">
                    {/* Subtle gradient top */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                    {/* Logo */}
                    <div className="flex h-14 items-center gap-2.5 px-5 border-b border-white/[0.06]">
                        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center glow-sm flex-shrink-0">
                            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
                        </div>
                        <span className="text-sm font-bold tracking-tight gradient-text">TaskFlow</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 space-y-1 mt-2">
                        <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                            Menu
                        </p>
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.name} href={item.href}>
                                    <div className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer ${isActive
                                            ? "bg-primary/15 text-primary border border-primary/20"
                                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                                        }`}>
                                        <item.icon className={`h-4 w-4 flex-shrink-0 transition-colors ${isActive ? "text-primary" : "group-hover:text-foreground"}`} />
                                        {item.name}
                                        {isActive && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Footer */}
                    <div className="p-3 border-t border-white/[0.06]">
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] mb-2">
                            <div className="relative flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                    {initials}
                                </div>
                                <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-card" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5 text-sm h-9"
                            onClick={() => logout()}
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Sign out
                        </Button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto flex flex-col">
                    {/* Mobile Header */}
                    <header className="flex h-14 items-center gap-4 border-b border-white/[0.06] bg-card/50 backdrop-blur-sm px-4 sm:hidden flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                                <Zap className="w-3.5 h-3.5 text-white" fill="white" />
                            </div>
                            <span className="text-sm font-bold gradient-text">TaskFlow</span>
                        </div>
                        <Button variant="ghost" size="icon" className="ml-auto" onClick={() => logout()}>
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </header>

                    {/* Page Content */}
                    <div className="flex-1 p-5 sm:p-7 md:p-9">
                        {children}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
