import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROJECT_STATUSES, Project } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (project: any) => Promise<void>;
  project?: Project;
}

export function ProjectDialog({ open, onOpenChange, onSubmit, project }: ProjectDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectName: project?.projectName || "",
    description: project?.description || "",
    status: project?.status || "Planning",
    startDate: project?.startDate || new Date().toISOString().split("T")[0],
    technologyStack: project?.technologyStack || [],
    repoLink: project?.repoLink || "",
    liveLink: project?.liveLink || "",
  });
  const [techInput, setTechInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
      if (!project) {
        setFormData({
          projectName: "",
          description: "",
          status: "Planning",
          startDate: new Date().toISOString().split("T")[0],
          technologyStack: [],
          repoLink: "",
          liveLink: "",
        });
      }
    } catch (error) {
      console.error("Error submitting project:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTech = () => {
    if (techInput.trim() && !formData.technologyStack.includes(techInput.trim())) {
      setFormData({
        ...formData,
        technologyStack: [...formData.technologyStack, techInput.trim()],
      });
      setTechInput("");
    }
  };

  const removeTech = (tech: string) => {
    setFormData({
      ...formData,
      technologyStack: formData.technologyStack.filter((t) => t !== tech),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Create New Project"}</DialogTitle>
          <DialogDescription>
            {project
              ? "Update your project information"
              : "Add a new project to your dashboard"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name *</Label>
            <Input
              id="projectName"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              required
              data-testid="input-project-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              data-testid="input-project-description"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger id="status" data-testid="select-project-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                data-testid="input-project-start-date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="techStack">Technology Stack</Label>
            <div className="flex gap-2">
              <Input
                id="techStack"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTech();
                  }
                }}
                placeholder="e.g., React, Node.js, Firebase"
                data-testid="input-tech-stack"
              />
              <Button type="button" onClick={addTech} variant="outline" data-testid="button-add-tech">
                Add
              </Button>
            </div>
            {formData.technologyStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.technologyStack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="gap-1">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTech(tech)}
                      className="ml-1 hover:text-destructive"
                      data-testid={`button-remove-tech-${tech}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="repoLink">Repository Link</Label>
            <Input
              id="repoLink"
              type="url"
              value={formData.repoLink}
              onChange={(e) => setFormData({ ...formData, repoLink: e.target.value })}
              placeholder="https://github.com/username/repo"
              data-testid="input-repo-link"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="liveLink">Live Link</Label>
            <Input
              id="liveLink"
              type="url"
              value={formData.liveLink}
              onChange={(e) => setFormData({ ...formData, liveLink: e.target.value })}
              placeholder="https://example.com"
              data-testid="input-live-link"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} data-testid="button-submit-project">
              {loading ? "Saving..." : project ? "Update Project" : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
