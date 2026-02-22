"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { LogOut, LayoutDashboard, CheckSquare, Zap } from "lucide-react";
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
                <aside className="hidden w-56 flex-col sm:flex border-r border-border bg-sidebar">
                    {/* Logo */}
                    <div className="flex h-14 items-center gap-2.5 px-4 border-b border-border flex-shrink-0">
                        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
                        </div>
                        <span className="text-sm font-bold tracking-tight gradient-text">TaskFlow</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 space-y-0.5 mt-1">
                        <p className="px-2 mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                            Menu
                        </p>
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.name} href={item.href}>
                                    <div className={`group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-all cursor-pointer ${isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                        }`}>
                                        <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
                                        {item.name}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Footer */}
                    <div className="p-3 border-t border-border flex-shrink-0">
                        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-background border border-border mb-1.5">
                            <div className="relative flex-shrink-0">
                                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white">
                                    {initials}
                                </div>
                                <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border-2 border-background" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground text-xs h-8"
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
                    <header className="flex h-14 items-center border-b border-border bg-sidebar px-4 sm:hidden flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                                <Zap className="w-3.5 h-3.5 text-white" fill="white" />
                            </div>
                            <span className="text-sm font-bold gradient-text">TaskFlow</span>
                        </div>
                        <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={() => logout()}>
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </header>

                    {/* Page Content */}
                    <div className="flex-1 p-6 sm:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
