import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { FolderKanban, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Project, PROJECT_STATUSES } from "@shared/schema";

interface DashboardProps {
  projects: Project[];
  loading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  Planning: "hsl(var(--chart-3))",
  Development: "hsl(var(--chart-1))",
  Testing: "hsl(var(--chart-2))",
  Live: "hsl(var(--chart-4))",
  Maintenance: "hsl(var(--chart-5))",
  "On Hold": "hsl(var(--muted))",
};

const STATUS_BADGE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  Planning: "secondary",
  Development: "default",
  Testing: "secondary",
  Live: "default",
  Maintenance: "secondary",
  "On Hold": "outline",
};

export function Dashboard({ projects, loading }: DashboardProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const statusCounts = PROJECT_STATUSES.reduce((acc, status) => {
    acc[status] = projects.filter((p) => p.status === status).length;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(statusCounts)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">Loading your dashboard...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-32 bg-muted" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.displayName?.split(" ")[0] || "Developer"}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your projects and activity
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-projects">
              {projects.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all statuses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-projects">
              {statusCounts.Development + statusCounts.Testing}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              In development or testing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Projects</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-live-projects">
              {statusCounts.Live}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Deployed and running
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
            <CardDescription>
              Visual breakdown of your projects by current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No projects yet. Create your first project to see visualizations!
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your 5 most recently updated projects
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/projects")}
              data-testid="button-view-all-projects"
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 rounded-md hover-elevate active-elevate-2 cursor-pointer"
                  onClick={() => setLocation(`/projects/${project.id}`)}
                  data-testid={`card-recent-project-${project.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{project.projectName}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {project.description || "No description"}
                    </p>
                  </div>
                  <Badge variant={STATUS_BADGE_VARIANTS[project.status]}>
                    {project.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No projects yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setLocation("/projects")}
                  data-testid="button-create-first-project"
                >
                  Create Your First Project
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>
              Jump to any of your projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 6).map((project) => (
                <Card
                  key={project.id}
                  className="hover-elevate active-elevate-2 cursor-pointer"
                  onClick={() => setLocation(`/projects/${project.id}`)}
                  data-testid={`card-quick-access-${project.id}`}
                >
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base line-clamp-1">
                        {project.projectName}
                      </CardTitle>
                      <Badge variant={STATUS_BADGE_VARIANTS[project.status]} className="shrink-0">
                        {project.status}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {project.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  {project.technologyStack.length > 0 && (
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1">
                        {project.technologyStack.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.technologyStack.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.technologyStack.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
