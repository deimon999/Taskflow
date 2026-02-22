"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Activity, CheckCircle2, Clock, ListTodo, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";

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
            title: "Total Tasks",
            value: stats?.total ?? 0,
            icon: Activity,
            accent: "text-indigo-600",
            iconBg: "bg-indigo-50 border-indigo-100",
            sub: "All time",
        },
        {
            title: "To Do",
            value: stats?.todo ?? 0,
            icon: ListTodo,
            accent: "text-amber-600",
            iconBg: "bg-amber-50 border-amber-100",
            sub: "Pending action",
        },
        {
            title: "In Progress",
            value: stats?.inProgress ?? 0,
            icon: Clock,
            accent: "text-blue-600",
            iconBg: "bg-blue-50 border-blue-100",
            sub: "Being worked on",
        },
        {
            title: "Completed",
            value: stats?.done ?? 0,
            icon: CheckCircle2,
            accent: "text-emerald-600",
            iconBg: "bg-emerald-50 border-emerald-100",
            sub: "Finished tasks",
        },
    ];

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Greeting */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">{getGreeting()},</p>
                    <h1 className="text-2xl font-bold text-foreground mt-0.5">
                        {user?.name?.split(" ")[0]} 👋
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        {isLoading
                            ? "Loading your workspace..."
                            : stats?.total === 0
                                ? "No tasks yet — head to Tasks to get started."
                                : `You've completed ${completionRate}% of your tasks. Keep going!`}
                    </p>
                </div>
                {!isLoading && stats && stats.total > 0 && (
                    <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-semibold">{completionRate}% Done</span>
                    </div>
                )}
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {isLoading
                    ? Array(4).fill(0).map((_, i) => (
                        <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-card">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-3 w-28" />
                        </div>
                    ))
                    : statCards.map((stat, i) => (
                        <div
                            key={i}
                            className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${stat.iconBg}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.accent}`} />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-foreground tabular-nums">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                        </div>
                    ))}
            </div>

            {/* Progress Bar */}
            {!isLoading && stats && stats.total > 0 && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-foreground">Overall Progress</h2>
                        <span className="text-sm text-muted-foreground">{stats.done} / {stats.total} tasks done</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-700"
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{completionRate}% completion rate</span>
                        <span>{stats.inProgress} in progress</span>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && stats?.total === 0 && (
                <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <ListTodo className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">No tasks yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                        Head over to Tasks to create your first task and start tracking progress.
                    </p>
                </div>
            )}
        </div>
    );
}
