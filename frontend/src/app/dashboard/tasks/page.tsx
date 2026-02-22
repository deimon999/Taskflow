"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TaskModal } from "@/components/TaskModal";
import { MoreHorizontal, Plus, Search, Trash, Edit, Calendar, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_CONFIG = {
    "todo": { label: "To Do", cls: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
    "in-progress": { label: "In Progress", cls: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
    "done": { label: "Done", cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
};

export default function TasksPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalTasks, setTotalTasks] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<string>("all");
    const [sort, setSort] = useState("newest");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<any>(null);

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            let url = `/tasks?page=${page}&limit=10`;
            if (search) url += `&search=${search}`;
            if (status !== "all") url += `&status=${status}`;
            if (sort !== "newest" && !search) url += `&sort=${sort}`;
            const { data } = await api.get(url);
            setTasks(data.tasks);
            setTotalTasks(data.total);
            setTotalPages(data.pages);
        } catch {
            toast.error("Failed to fetch tasks");
        } finally {
            setIsLoading(false);
        }
    }, [page, search, status, sort]);

    useEffect(() => {
        const t = setTimeout(fetchTasks, 300);
        return () => clearTimeout(t);
    }, [fetchTasks]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            await api.delete(`/tasks/${id}`);
            toast.success("Task deleted");
            fetchTasks();
        } catch {
            toast.error("Failed to delete task");
        }
    };

    const handleEdit = (task: any) => { setTaskToEdit(task); setIsModalOpen(true); };
    const handleCreate = () => { setTaskToEdit(null); setIsModalOpen(true); };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Tasks</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        {isLoading ? "Loading..." : `${totalTasks} task${totalTasks !== 1 ? "s" : ""} total`}
                    </p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl h-10 px-5 glow-sm gap-2 transition-all"
                >
                    <Plus className="h-4 w-4" /> Add Task
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tasks..."
                        className="pl-9 bg-white/[0.04] border-white/[0.08] focus:border-primary/40 rounded-xl h-10"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                    <SelectTrigger className="w-full sm:w-44 bg-white/[0.04] border-white/[0.08] rounded-xl h-10 text-sm">
                        <SlidersHorizontal className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={sort} onValueChange={setSort} disabled={!!search}>
                    <SelectTrigger className="w-full sm:w-44 bg-white/[0.04] border-white/[0.08] rounded-xl h-10 text-sm">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10">
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="dueDate">By Due Date</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-white/[0.06] bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/[0.06] hover:bg-transparent">
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-5 w-[45%]">
                                Task
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Status
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Due Date
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pr-5 text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <TableRow key={i} className="border-white/[0.04]">
                                    <TableCell className="pl-5">
                                        <Skeleton className="h-4 w-48 mb-2" />
                                        <Skeleton className="h-3 w-32" />
                                    </TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="pr-5 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></TableCell>
                                </TableRow>
                            ))
                        ) : tasks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-40 text-center">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <Search className="w-8 h-8 opacity-40" />
                                        <p className="text-sm">No tasks found</p>
                                        <p className="text-xs opacity-70">Try adjusting your filters or create a new task</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            tasks.map((task) => {
                                const sc = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG];
                                return (
                                    <TableRow key={task._id} className="border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                                        <TableCell className="pl-5 py-4">
                                            <p className="font-medium text-foreground text-sm">{task.title}</p>
                                            {task.description && (
                                                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{task.description}</p>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${sc?.cls}`}>
                                                {sc?.label ?? task.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {task.dueDate ? (
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span className="text-xs">{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground/50">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="pr-5 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-card border-white/10 w-40">
                                                    <DropdownMenuItem
                                                        onClick={() => handleEdit(task)}
                                                        className="gap-2 text-sm cursor-pointer"
                                                    >
                                                        <Edit className="h-3.5 w-3.5" /> Edit Task
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-white/[0.06]" />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(task._id)}
                                                        className="gap-2 text-sm text-destructive focus:text-destructive cursor-pointer"
                                                    >
                                                        <Trash className="h-3.5 w-3.5" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        Showing page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg border-white/[0.08] bg-white/[0.04]"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || isLoading}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg border-white/[0.08] bg-white/[0.04]"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || isLoading}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                taskToEdit={taskToEdit}
                onSuccess={fetchTasks}
            />
        </div>
    );
}
