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
            <DialogContent className="bg-card border-white/[0.08] rounded-2xl sm:max-w-[440px] p-0 overflow-hidden">
                {/* Modal header gradient line */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

                <div className="p-6">
                    <DialogHeader className="mb-5">
                        <DialogTitle className="text-lg font-semibold text-foreground">
                            {taskToEdit ? "Edit Task" : "Create New Task"}
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {taskToEdit ? "Update the details of your task." : "Fill in the details to create a new task."}
                        </p>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</Label>
                            <Input
                                placeholder="What needs to be done?"
                                className="bg-white/[0.04] border-white/[0.08] focus:border-primary/40 rounded-xl h-10"
                                {...form.register("title")}
                            />
                            {form.formState.errors.title && (
                                <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description <span className="normal-case font-normal">(optional)</span></Label>
                            <Input
                                placeholder="Add more details..."
                                className="bg-white/[0.04] border-white/[0.08] focus:border-primary/40 rounded-xl h-10"
                                {...form.register("description")}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</Label>
                                <Select
                                    value={form.watch("status")}
                                    onValueChange={(val: any) => form.setValue("status", val)}
                                >
                                    <SelectTrigger className="bg-white/[0.04] border-white/[0.08] rounded-xl h-10 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-white/10">
                                        <SelectItem value="todo">To Do</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="done">Done</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Due Date <span className="normal-case font-normal">(optional)</span></Label>
                                <Input
                                    type="date"
                                    className="bg-white/[0.04] border-white/[0.08] focus:border-primary/40 rounded-xl h-10 text-sm"
                                    {...form.register("dueDate")}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                className="rounded-xl h-10 text-muted-foreground hover:text-foreground"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="rounded-xl h-10 bg-primary hover:bg-primary/90 text-white font-semibold px-6 glow-sm"
                            >
                                {form.formState.isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : taskToEdit ? "Save Changes" : "Create Task"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
