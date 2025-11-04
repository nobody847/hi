import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Code2 } from "lucide-react";
import { Project } from "@shared/schema";

interface TechnologiesProps {
  projects: Project[];
  loading: boolean;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function Technologies({ projects, loading }: TechnologiesProps) {
  const techCounts = projects.reduce((acc, project) => {
    project.technologyStack.forEach((tech) => {
      acc[tech] = (acc[tech] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(techCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <Card className="animate-pulse">
          <CardHeader className="h-64 bg-muted" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Technologies</h1>
        <p className="text-muted-foreground mt-1">
          Analyze your most-used technologies across all projects
        </p>
      </div>

      {chartData.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Technology Usage</CardTitle>
              <CardDescription>
                Number of projects using each technology
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 100, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    width={90}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value) => [`${value} project${value !== 1 ? 's' : ''}`, 'Count']}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technology Stats</CardTitle>
              <CardDescription>
                Quick overview of your tech stack
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Technologies</span>
                  <span className="font-bold text-xl" data-testid="text-total-technologies">
                    {chartData.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Most Used</span>
                  <span className="font-semibold" data-testid="text-most-used-tech">
                    {chartData[0]?.name || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usage Count</span>
                  <span className="font-semibold">
                    {chartData[0]?.count || 0} projects
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">Top Technologies</h4>
                <div className="space-y-2">
                  {chartData.slice(0, 8).map((tech, index) => (
                    <div
                      key={tech.name}
                      className="flex items-center justify-between text-sm"
                      data-testid={`tech-item-${tech.name}`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-sm"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="truncate">{tech.name}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {tech.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Code2 className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No technology data yet</h3>
            <p className="text-muted-foreground text-center">
              Add technologies to your projects to see analytics here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
