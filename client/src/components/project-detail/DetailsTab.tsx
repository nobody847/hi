import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, GitBranch, Globe } from "lucide-react";
import { Project } from "@shared/schema";

interface DetailsTabProps {
  project: Project;
}

export function DetailsTab({ project }: DetailsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge>{project.status}</Badge>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date
              </p>
              <p className="font-medium">
                {new Date(project.startDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {project.repoLink && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Repository
                </p>
                <a
                  href={project.repoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline break-all"
                  data-testid="link-repo-detail"
                >
                  {project.repoLink}
                </a>
              </div>
            )}

            {project.liveLink && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Live Site
                </p>
                <a
                  href={project.liveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline break-all"
                  data-testid="link-live-detail"
                >
                  {project.liveLink}
                </a>
              </div>
            )}
          </div>

          {project.description && (
            <div className="space-y-1 pt-2 border-t">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm">{project.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technology Stack</CardTitle>
        </CardHeader>
        <CardContent>
          {project.technologyStack.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {project.technologyStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-sm">
                  {tech}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No technologies added yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
