import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Users, Mail } from "lucide-react";
import { TeamMember } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface TeamTabProps {
  projectId: string;
  teamMembers: TeamMember[];
  onCreateTeamMember: (member: any) => Promise<void>;
  onDeleteTeamMember: (id: string) => Promise<void>;
}

export function TeamTab({
  projectId,
  teamMembers,
  onCreateTeamMember,
  onDeleteTeamMember,
}: TeamTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    contact: "",
  });

  const handleAdd = async () => {
    if (!formData.name.trim() || !formData.role.trim()) return;

    try {
      await onCreateTeamMember({
        projectId,
        ...formData,
      });
      setFormData({ name: "", role: "", contact: "" });
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding team member:", error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage colleagues working on this project
          </CardDescription>
        </div>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          data-testid="button-add-team-member"
        >
          <Plus className="mr-2 h-4 w-4" />
          {isAdding ? "Cancel" : "Add Member"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="member-name">Name *</Label>
                <Input
                  id="member-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  data-testid="input-member-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-role">Role *</Label>
                <Input
                  id="member-role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Frontend Dev, UI/UX Designer"
                  data-testid="input-member-role"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-contact">Contact</Label>
                <Input
                  id="member-contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="Email or handle"
                  data-testid="input-member-contact"
                />
              </div>
              <Button
                onClick={handleAdd}
                disabled={!formData.name.trim() || !formData.role.trim()}
                className="w-full"
                data-testid="button-save-team-member"
              >
                Add Team Member
              </Button>
            </CardContent>
          </Card>
        )}

        {teamMembers.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {teamMembers.map((member) => (
              <Card key={member.id} data-testid={`card-team-member-${member.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{member.name}</p>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {member.role}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteTeamMember(member.id)}
                          data-testid={`button-delete-team-member-${member.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {member.contact && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{member.contact}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !isAdding ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="h-16 w-16 opacity-50 mb-4" />
            <p className="text-center">No team members added yet</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
