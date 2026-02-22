"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
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

    const statCards = [
        {
            title: "Total Tasks",
            value: stats?.total ?? 0,
            icon: Activity,
            gradient: "from-violet-500/20 to-violet-600/5",
            iconColor: "text-violet-400",
            iconBg: "bg-violet-500/10 border-violet-500/20",
            change: "All time",
        },
        {
            title: "To Do",
            value: stats?.todo ?? 0,
            icon: ListTodo,
            gradient: "from-amber-500/20 to-amber-600/5",
            iconColor: "text-amber-400",
            iconBg: "bg-amber-500/10 border-amber-500/20",
            change: "Pending action",
        },
        {
            title: "In Progress",
            value: stats?.inProgress ?? 0,
            icon: Clock,
            gradient: "from-blue-500/20 to-blue-600/5",
            iconColor: "text-blue-400",
            iconBg: "bg-blue-500/10 border-blue-500/20",
            change: "Being worked on",
        },
        {
            title: "Completed",
            value: stats?.done ?? 0,
            icon: CheckCircle2,
            gradient: "from-emerald-500/20 to-emerald-600/5",
            iconColor: "text-emerald-400",
            iconBg: "bg-emerald-500/10 border-emerald-500/20",
            change: "Finished tasks",
        },
    ];

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="space-y-8">
            {/* Hero greeting */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-muted-foreground text-sm mb-1">{getGreeting()},</p>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {user?.name?.split(" ")[0]} <span className="gradient-text">👋</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm max-w-md">
                        {isLoading
                            ? "Loading your workspace..."
                            : stats?.total === 0
                                ? "You have no tasks yet. Head to Tasks to get started."
                                : `You've completed ${completionRate}% of your tasks. Keep it up!`}
                    </p>
                </div>
                {!isLoading && stats && stats.total > 0 && (
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl glass border border-emerald-500/20 text-emerald-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-semibold">{completionRate}% Complete</span>
                    </div>
                )}
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {isLoading
                    ? Array(4).fill(0).map((_, i) => (
                        <div key={i} className="rounded-2xl border border-white/[0.06] bg-card p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-3 w-28" />
                        </div>
                    ))
                    : statCards.map((stat, index) => (
                        <div
                            key={index}
                            className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br ${stat.gradient} p-5 transition-transform hover:-translate-y-0.5 duration-200`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${stat.iconBg}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-foreground tabular-nums">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1.5">{stat.change}</p>
                        </div>
                    ))}
            </div>

            {/* Progress bar */}
            {!isLoading && stats && stats.total > 0 && (
                <div className="rounded-2xl border border-white/[0.06] bg-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-foreground">Overall Progress</h2>
                        <span className="text-sm text-muted-foreground">{stats.done}/{stats.total} tasks done</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-700"
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                        <span>{completionRate}% completion rate</span>
                        <span>{stats.inProgress} in progress</span>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && stats?.total === 0 && (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-white/10 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                        <ListTodo className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">No tasks yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                        Head over to the Tasks page to create your first task and start tracking progress.
                    </p>
                </div>
            )}
        </div>
    );
}
