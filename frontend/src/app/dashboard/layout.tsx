"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { LogOut, LayoutDashboard, CheckSquare, Zap, User, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
    { name: "Profile", href: "/dashboard/profile", icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { logout, user } = useAuth();
    const pathname = usePathname();

    const initials = user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const currentNav = navigation.find((n) => n.href === pathname);
    const pageTitle = currentNav?.name ?? "Dashboard";

    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-background">

                {/* ── Desktop Sidebar ── */}
                <aside className="hidden md:flex w-56 flex-col border-r border-border bg-sidebar flex-shrink-0">
                    {/* Logo */}
                    <div className="flex h-14 items-center gap-2.5 px-4 border-b border-border">
                        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
                        </div>
                        <span className="text-sm font-bold tracking-tight gradient-text">TaskFlow</span>
                    </div>

                    {/* Nav links */}
                    <nav className="flex-1 px-3 py-4 space-y-0.5">
                        <p className="px-2 mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                            Menu
                        </p>
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.name} href={item.href}>
                                    <div className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors cursor-pointer ${isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        }`}>
                                        <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
                                        <span className="flex-1">{item.name}</span>
                                        {isActive && <ChevronRight className="h-3 w-3 text-primary/60" />}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User card at bottom */}
                    <div className="px-3 pb-4 border-t border-border pt-3 flex-shrink-0">
                        <Link href="/dashboard/profile">
                            <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-md hover:bg-accent transition-colors cursor-pointer">
                                <div className="relative flex-shrink-0">
                                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white">
                                        {initials}
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border-2 border-sidebar" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </aside>

                {/* ── Main area ── */}
                <div className="flex-1 flex flex-col overflow-hidden min-w-0">

                    {/* Top header */}
                    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 sm:px-6 flex-shrink-0">
                        {/* Logo (mobile only) + Page title */}
                        <div className="flex items-center gap-3">
                            <div className="md:hidden flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                                    <Zap className="w-3 h-3 text-white" fill="white" />
                                </div>
                                <span className="text-sm font-bold gradient-text">TaskFlow</span>
                            </div>
                            <span className="hidden md:block text-sm font-semibold text-foreground">{pageTitle}</span>
                        </div>

                        {/* Right: user + sign out */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Link href="/dashboard/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                                    {initials}
                                </div>
                                <span className="hidden sm:block text-sm font-medium text-foreground truncate max-w-[120px]">{user?.name}</span>
                            </Link>
                            <div className="hidden sm:block w-px h-5 bg-border" />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground h-8 gap-1.5 text-xs px-2"
                                onClick={() => logout()}
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                <span className="hidden sm:block">Sign out</span>
                            </Button>
                        </div>
                    </header>

                    {/* Scrollable page content — extra bottom padding on mobile for bottom nav */}
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-20 md:pb-8">
                        {children}
                    </main>
                </div>
            </div>

            {/* ── Mobile Bottom Navigation ── */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 border-t border-border bg-background/95 backdrop-blur-sm z-50">
                <div className="flex items-center">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href} className="flex-1">
                                <div className={`flex flex-col items-center justify-center gap-1 py-3 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"
                                    }`}>
                                    <item.icon className="h-5 w-5" />
                                    <span className="text-[10px] font-medium">{item.name}</span>
                                    {isActive && (
                                        <div className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full" />
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </ProtectedRoute>
    );
}
