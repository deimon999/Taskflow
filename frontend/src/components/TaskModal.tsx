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
            <DialogContent className="bg-card border-border rounded-xl sm:max-w-[420px]">
                <DialogHeader className="mb-2">
                    <DialogTitle className="text-base font-semibold text-foreground">
                        {taskToEdit ? "Edit Task" : "New Task"}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        {taskToEdit ? "Update the details below." : "Fill in the details to create a task."}
                    </p>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title</Label>
                        <Input
                            placeholder="What needs to be done?"
                            className="h-9 border-border bg-background"
                            {...form.register("title")}
                        />
                        {form.formState.errors.title && (
                            <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Description <span className="normal-case font-normal text-muted-foreground">(optional)</span>
                        </Label>
                        <Input
                            placeholder="Add more context..."
                            className="h-9 border-border bg-background"
                            {...form.register("description")}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</Label>
                            <Select value={form.watch("status")} onValueChange={(val: any) => form.setValue("status", val)}>
                                <SelectTrigger className="h-9 border-border bg-background text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Due Date <span className="normal-case font-normal">(optional)</span>
                            </Label>
                            <Input
                                type="date"
                                className="h-9 border-border bg-background text-sm"
                                {...form.register("dueDate")}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <Button type="button" variant="ghost" onClick={onClose} className="h-9 text-sm">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                            className="h-9 bg-primary hover:bg-primary/90 text-white font-semibold px-5 text-sm"
                        >
                            {form.formState.isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : taskToEdit ? "Save Changes" : "Create Task"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
