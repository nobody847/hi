import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Copy, Trash2, Eye, EyeOff, Key, AlertTriangle } from "lucide-react";
import { Credential } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CredentialsTabProps {
  projectId: string;
  credentials: Credential[];
  onCreateCredential: (credential: any) => Promise<void>;
  onDeleteCredential: (id: string) => Promise<void>;
}

export function CredentialsTab({
  projectId,
  credentials,
  onCreateCredential,
  onDeleteCredential,
}: CredentialsTabProps) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [visibleCredentials, setVisibleCredentials] = useState<Set<string>>(new Set());

  const handleAdd = async () => {
    if (!newKey.trim() || !newValue.trim()) return;

    try {
      await onCreateCredential({
        projectId,
        key: newKey.trim(),
        value: newValue.trim(),
      });
      setNewKey("");
      setNewValue("");
      setIsAdding(false);
      toast({
        title: "Credential added",
        description: "The credential has been saved successfully.",
      });
    } catch (error) {
      console.error("Error adding credential:", error);
      toast({
        title: "Error",
        description: "Failed to add credential. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Copied to clipboard",
      description: `"${key}" has been copied to your clipboard.`,
    });
  };

  const toggleVisibility = (id: string) => {
    const newSet = new Set(visibleCredentials);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setVisibleCredentials(newSet);
  };

  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Warning:</strong> For development convenience only. Do not store production master keys here. Use environment variables and proper secret management for production.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Credentials</CardTitle>
            <CardDescription>
              Securely store API keys and passwords for this project
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            data-testid="button-add-credential"
          >
            <Plus className="mr-2 h-4 w-4" />
            {isAdding ? "Cancel" : "Add Credential"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAdding && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="new-key">Key Name</Label>
                  <Input
                    id="new-key"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="e.g., API_KEY, DATABASE_PASSWORD"
                    data-testid="input-credential-key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-value">Value</Label>
                  <Input
                    id="new-value"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Enter the credential value"
                    type="password"
                    data-testid="input-credential-value"
                  />
                </div>
                <Button
                  onClick={handleAdd}
                  disabled={!newKey.trim() || !newValue.trim()}
                  className="w-full"
                  data-testid="button-save-credential"
                >
                  Save Credential
                </Button>
              </CardContent>
            </Card>
          )}

          {credentials.length > 0 ? (
            <div className="space-y-3">
              {credentials.map((credential) => (
                <Card key={credential.id} data-testid={`card-credential-${credential.id}`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{credential.key}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleVisibility(credential.id)}
                            data-testid={`button-toggle-visibility-${credential.id}`}
                          >
                            {visibleCredentials.has(credential.id) ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(credential.value, credential.key)}
                            data-testid={`button-copy-credential-${credential.id}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeleteCredential(credential.id)}
                            data-testid={`button-delete-credential-${credential.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="bg-muted p-3 rounded-md font-mono text-sm break-all">
                        {visibleCredentials.has(credential.id)
                          ? credential.value
                          : "•".repeat(Math.min(credential.value.length, 40))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !isAdding ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Key className="h-16 w-16 opacity-50 mb-4" />
              <p className="text-center">No credentials stored yet</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
