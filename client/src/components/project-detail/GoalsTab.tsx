import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Target, Check } from "lucide-react";
import { Goal } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";

interface GoalsTabProps {
  projectId: string;
  goals: Goal[];
  onCreateGoal: (goal: any) => Promise<void>;
  onUpdateGoal: (id: string, goal: any) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
}

export function GoalsTab({
  projectId,
  goals,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
}: GoalsTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newGoalText, setNewGoalText] = useState("");

  const handleAdd = async () => {
    if (!newGoalText.trim()) return;

    try {
      await onCreateGoal({
        projectId,
        text: newGoalText.trim(),
        completed: false,
      });
      setNewGoalText("");
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  };

  const handleToggle = async (goal: Goal) => {
    try {
      await onUpdateGoal(goal.id, {
        ...goal,
        completed: !goal.completed,
      });
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  const completedGoals = goals.filter((g) => g.completed);
  const activeGoals = goals.filter((g) => !g.completed);
  const completionPercentage = goals.length > 0
    ? Math.round((completedGoals.length / goals.length) * 100)
    : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Future Goals</CardTitle>
          <CardDescription>
            Track your project's roadmap and objectives
          </CardDescription>
        </div>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          data-testid="button-add-goal"
        >
          <Plus className="mr-2 h-4 w-4" />
          {isAdding ? "Cancel" : "Add Goal"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold" data-testid="text-goal-progress">
                {completedGoals.length} / {goals.length} completed
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}

        {isAdding && (
          <div className="flex gap-2">
            <Input
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              placeholder="Enter a new goal..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              data-testid="input-goal-text"
            />
            <Button
              onClick={handleAdd}
              disabled={!newGoalText.trim()}
              data-testid="button-save-goal"
            >
              Add
            </Button>
          </div>
        )}

        {activeGoals.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Active Goals ({activeGoals.length})</h4>
            {activeGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center gap-3 p-3 rounded-md hover-elevate"
                data-testid={`card-goal-${goal.id}`}
              >
                <Checkbox
                  checked={goal.completed}
                  onCheckedChange={() => handleToggle(goal)}
                  data-testid={`checkbox-goal-${goal.id}`}
                />
                <span className="flex-1">{goal.text}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteGoal(goal.id)}
                  data-testid={`button-delete-goal-${goal.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {completedGoals.length > 0 && (
          <div className="space-y-2 border-t pt-4">
            <h4 className="text-sm font-semibold">Completed Goals ({completedGoals.length})</h4>
            {completedGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center gap-3 p-3 rounded-md opacity-60"
              >
                <Checkbox
                  checked={goal.completed}
                  onCheckedChange={() => handleToggle(goal)}
                  data-testid={`checkbox-completed-goal-${goal.id}`}
                />
                <span className="flex-1 line-through">{goal.text}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteGoal(goal.id)}
                  data-testid={`button-delete-completed-goal-${goal.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {goals.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Target className="h-16 w-16 opacity-50 mb-4" />
            <p className="text-center">No goals set yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
