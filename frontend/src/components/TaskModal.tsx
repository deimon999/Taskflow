"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

const taskSchema = z.object({
    title: z.string().min(1, "Title is required").max(100),
    description: z.string().max(500).optional(),
    status: z.enum(["todo", "in-progress", "done"]),
    dueDate: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskToEdit?: any;
    onSuccess: () => void;
}

export function TaskModal({ isOpen, onClose, taskToEdit, onSuccess }: TaskModalProps) {
    const form = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema),
        defaultValues: { title: "", description: "", status: "todo", dueDate: "" },
    });

    useEffect(() => {
        if (taskToEdit) {
            form.reset({
                title: taskToEdit.title,
                description: taskToEdit.description || "",
                status: taskToEdit.status,
                dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split("T")[0] : "",
            });
        } else {
            form.reset({ title: "", description: "", status: "todo", dueDate: "" });
        }
    }, [taskToEdit, form, isOpen]);

    const onSubmit = async (data: TaskFormValues) => {
        try {
            if (taskToEdit) {
                await api.put(`/tasks/${taskToEdit._id}`, data);
                toast.success("Task updated!");
            } else {
                await api.post("/tasks", data);
                toast.success("Task created!");
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save task");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card border-border rounded-xl sm:max-w-[440px] p-0 overflow-hidden">
                {/* Colour-accent top bar */}
                <div className="h-1 w-full bg-primary" />

                <div className="p-6">
                    <DialogHeader className="mb-5">
                        <DialogTitle className="text-base font-semibold">
                            {taskToEdit ? "Edit Task" : "New Task"}
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground">
                            {taskToEdit ? "Update the task details below." : "Fill in the details to create a task."}
                        </p>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Title */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title *</Label>
                            <Input
                                placeholder="What needs to be done?"
                                className="h-9 border-border bg-background"
                                {...form.register("title")}
                            />
                            {form.formState.errors.title && (
                                <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                            )}
                        </div>

                        {/* Description — now a textarea */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Description <span className="normal-case font-normal text-muted-foreground">(optional)</span>
                            </Label>
                            <textarea
                                placeholder="Add more context or notes..."
                                rows={3}
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring resize-none transition-colors"
                                {...form.register("description")}
                            />
                            {form.formState.errors.description && (
                                <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
                            )}
                        </div>

                        {/* Status + Due Date */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</Label>
                                <Select value={form.watch("status")} onValueChange={(val: any) => form.setValue("status", val)}>
                                    <SelectTrigger className="h-9 border-border bg-background text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todo">
                                            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400" />To Do</span>
                                        </SelectItem>
                                        <SelectItem value="in-progress">
                                            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-400" />In Progress</span>
                                        </SelectItem>
                                        <SelectItem value="done">
                                            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400" />Done</span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Due Date</Label>
                                <Input
                                    type="date"
                                    className="h-9 border-border bg-background text-sm"
                                    {...form.register("dueDate")}
                                />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-border" />

                        {/* Actions */}
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={onClose} className="h-9 text-sm px-4">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="h-9 bg-primary hover:bg-primary/90 text-white font-semibold px-5 text-sm"
                            >
                                {form.formState.isSubmitting
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : taskToEdit ? "Save Changes" : "Create Task"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
