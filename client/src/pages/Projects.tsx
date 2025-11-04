import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FolderKanban } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Project } from "@shared/schema";
import { ProjectDialog } from "@/components/projects/ProjectDialog";

interface ProjectsProps {
  projects: Project[];
  loading: boolean;
  onCreateProject: (project: any) => Promise<void>;
  onUpdateProject: (id: string, project: any) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
}

const STATUS_BADGE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  Planning: "secondary",
  Development: "default",
  Testing: "secondary",
  Live: "default",
  Maintenance: "secondary",
  "On Hold": "outline",
};

export function Projects({
  projects,
  loading,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
}: ProjectsProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase();
    return (
      project.projectName.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.technologyStack.some((tech) => tech.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-40 bg-muted" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your development projects in one place
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          data-testid="button-create-project"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects by name, description, or technology..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search-projects"
        />
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="hover-elevate active-elevate-2 cursor-pointer flex flex-col"
              onClick={() => setLocation(`/projects/${project.id}`)}
              data-testid={`card-project-${project.id}`}
            >
              <CardHeader className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="text-lg line-clamp-1">
                    {project.projectName}
                  </CardTitle>
                  <Badge variant={STATUS_BADGE_VARIANTS[project.status]} className="shrink-0">
                    {project.status}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                  {project.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.technologyStack.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.technologyStack.slice(0, 4).map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {project.technologyStack.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.technologyStack.length - 4}
                      </Badge>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Started {new Date(project.startDate).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "No projects found" : "No projects yet"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Create your first project to get started"}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                data-testid="button-create-first-project"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <ProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={onCreateProject}
      />
    </div>
  );
}
