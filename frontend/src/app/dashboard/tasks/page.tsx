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
    "todo": { label: "To Do", cls: "text-amber-700 bg-amber-50 border-amber-200" },
    "in-progress": { label: "In Progress", cls: "text-blue-700 bg-blue-50 border-blue-200" },
    "done": { label: "Done", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
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
        <div className="w-full space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Tasks</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {isLoading ? "Loading..." : `${totalTasks} task${totalTasks !== 1 ? "s" : ""}`}
                    </p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg h-9 px-3 sm:px-4 gap-1.5 text-sm flex-shrink-0"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:block">Add Task</span>
                </Button>
            </div>

            {/* Filters — stack on mobile, row on desktop */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search tasks..."
                        className="pl-8 h-9 border-border bg-background text-sm"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                        <SelectTrigger className="flex-1 sm:w-36 h-9 border-border bg-background text-sm">
                            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-muted-foreground flex-shrink-0" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sort} onValueChange={setSort} disabled={!!search}>
                        <SelectTrigger className="flex-1 sm:w-36 h-9 border-border bg-background text-sm">
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="oldest">Oldest</SelectItem>
                            <SelectItem value="dueDate">Due Date</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* ── MOBILE: Card list ── */}
            <div className="md:hidden space-y-2">
                {isLoading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-card">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                            <div className="flex gap-2 mt-2">
                                <Skeleton className="h-5 w-20 rounded-full" />
                                <Skeleton className="h-5 w-24 rounded-full" />
                            </div>
                        </div>
                    ))
                ) : tasks.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                        <Search className="w-7 h-7 opacity-40" />
                        <p className="text-sm font-medium">No tasks found</p>
                        <p className="text-xs opacity-70">Try a different filter or create a new task</p>
                    </div>
                ) : (
                    tasks.map((task) => {
                        const sc = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG];
                        return (
                            <div key={task._id} className="rounded-xl border border-border bg-card p-4 shadow-card">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-foreground truncate">{task.title}</p>
                                        {task.description && (
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{task.description}</p>
                                        )}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-7 w-7 p-0 flex-shrink-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-36">
                                            <DropdownMenuItem onClick={() => handleEdit(task)} className="gap-2 text-sm">
                                                <Edit className="h-3.5 w-3.5" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleDelete(task._id)} className="gap-2 text-sm text-destructive focus:text-destructive">
                                                <Trash className="h-3.5 w-3.5" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${sc?.cls}`}>
                                        {sc?.label}
                                    </span>
                                    {task.dueDate && (
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(task.dueDate), "MMM d, yyyy")}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ── DESKTOP: Table ── */}
            <div className="hidden md:block rounded-xl border border-border bg-card shadow-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pl-5 w-[45%]">Task</TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Due Date</TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pr-5 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <TableRow key={i} className="border-border">
                                    <TableCell className="pl-5"><Skeleton className="h-4 w-48 mb-1.5" /><Skeleton className="h-3 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="pr-5 text-right"><Skeleton className="h-7 w-7 ml-auto rounded" /></TableCell>
                                </TableRow>
                            ))
                        ) : tasks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-36 text-center">
                                    <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                                        <Search className="w-6 h-6 opacity-40" />
                                        <p className="text-sm font-medium">No tasks found</p>
                                        <p className="text-xs opacity-70">Adjust filters or create a new task</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            tasks.map((task) => {
                                const sc = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG];
                                return (
                                    <TableRow key={task._id} className="border-border hover:bg-muted/30 transition-colors group">
                                        <TableCell className="pl-5 py-3.5">
                                            <p className="font-medium text-foreground text-sm">{task.title}</p>
                                            {task.description && (
                                                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{task.description}</p>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${sc?.cls}`}>
                                                {sc?.label}
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
                                                    <Button variant="ghost" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-36">
                                                    <DropdownMenuItem onClick={() => handleEdit(task)} className="gap-2 text-sm cursor-pointer">
                                                        <Edit className="h-3.5 w-3.5" /> Edit Task
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleDelete(task._id)} className="gap-2 text-sm text-destructive focus:text-destructive cursor-pointer">
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
                    <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
                    <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                            onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isLoading}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || isLoading}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} taskToEdit={taskToEdit} onSuccess={fetchTasks} />
        </div>
    );
}
