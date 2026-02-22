"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Activity, CheckCircle2, Clock, ListTodo, TrendingUp, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TaskStats {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
}

export default function DashboardHome() {
    const { user } = useAuth();
    const [stats, setStats] = useState<TaskStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get("/tasks?limit=1000");
                const tasks = data.tasks;
                setStats({
                    total: tasks.length,
                    todo: tasks.filter((t: any) => t.status === "todo").length,
                    inProgress: tasks.filter((t: any) => t.status === "in-progress").length,
                    done: tasks.filter((t: any) => t.status === "done").length,
                });
            } catch {
                // silently fail
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const completionRate = stats && stats.total > 0
        ? Math.round((stats.done / stats.total) * 100)
        : 0;

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    };

    const statCards = [
        {
            title: "Total",
            value: stats?.total ?? 0,
            icon: Activity,
            accent: "text-indigo-600",
            iconBg: "bg-indigo-50 border-indigo-100",
        },
        {
            title: "To Do",
            value: stats?.todo ?? 0,
            icon: ListTodo,
            accent: "text-amber-600",
            iconBg: "bg-amber-50 border-amber-100",
        },
        {
            title: "In Progress",
            value: stats?.inProgress ?? 0,
            icon: Clock,
            accent: "text-blue-600",
            iconBg: "bg-blue-50 border-blue-100",
        },
        {
            title: "Done",
            value: stats?.done ?? 0,
            icon: CheckCircle2,
            accent: "text-emerald-600",
            iconBg: "bg-emerald-50 border-emerald-100",
        },
    ];

    return (
        <div className="w-full space-y-6">
            {/* Greeting row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <p className="text-xs text-muted-foreground">{getGreeting()},</p>
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">
                        {user?.name?.split(" ")[0]} 👋
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        {isLoading
                            ? "Loading your workspace..."
                            : stats?.total === 0
                                ? "No tasks yet — create one to get started."
                                : `You've completed ${completionRate}% of your tasks.`}
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {!isLoading && stats && stats.total > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-semibold">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {completionRate}% Done
                        </div>
                    )}
                    <Link href="/dashboard/tasks">
                        <Button className="h-9 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 gap-1.5">
                            <Plus className="w-4 h-4" /> New Task
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stat Cards — 2 col on mobile, 4 on desktop */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                {isLoading
                    ? Array(4).fill(0).map((_, i) => (
                        <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-card">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-7 w-7 rounded-lg" />
                            </div>
                            <Skeleton className="h-7 w-12" />
                        </div>
                    ))
                    : statCards.map((stat, i) => (
                        <div
                            key={i}
                            className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-card hover:shadow-card-hover transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${stat.iconBg}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.accent}`} />
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">{stat.value}</div>
                        </div>
                    ))}
            </div>

            {/* Progress Bar */}
            {!isLoading && stats && stats.total > 0 && (
                <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-card">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-foreground">Overall Progress</h2>
                        <span className="text-xs text-muted-foreground">{stats.done} / {stats.total} done</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-700"
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{completionRate}% completion rate</span>
                        {stats.inProgress > 0 && <span>{stats.inProgress} in progress</span>}
                    </div>
                </div>
            )}




            {/* Empty State */}
            {!isLoading && stats?.total === 0 && (
                <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <ListTodo className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">No tasks yet</h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">Create your first task to start tracking progress</p>
                    <Link href="/dashboard/tasks">
                        <Button size="sm" className="bg-primary text-white hover:bg-primary/90 h-8 px-4 text-xs gap-1.5">
                            <Plus className="w-3.5 h-3.5" /> Create Task
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
