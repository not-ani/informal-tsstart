import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, Lock, Mail, Check, X, Users } from "lucide-react";
import { api } from "@informal-tsstart/backend/convex/_generated/api";
import type { Id } from "@informal-tsstart/backend/convex/_generated/dataModel";

interface PermissionWrapperProps {
  formId: string;
  requiredPermission: "view" | "edit" | "manage";
  children: React.ReactNode;
  fallbackMessage?: string;
}

export function PermissionWrapper({
  formId,
  requiredPermission,
  children,
  fallbackMessage,
}: PermissionWrapperProps) {
  const [isAccepting, setIsAccepting] = useState(false);

  // Queries
  const permissions = useQuery(api.collaborators.getFormPermissions, {
    formId: formId as Id<"forms">,
  });
  const pendingInvitation = useQuery(
    api.collaborators.getPendingInvitationForForm,
    {
      formId: formId as Id<"forms">,
    }
  );

  // Mutations
  const acceptInvitation = useMutation(api.collaborators.acceptInvitation);
  const rejectInvitation = useMutation(api.collaborators.rejectInvitation);

  // Handle accept invitation
  const handleAccept = async () => {
    if (!pendingInvitation) return;

    setIsAccepting(true);
    try {
      await acceptInvitation({ collaborationId: pendingInvitation._id });
      toast.success("Invitation accepted! You now have access to this form.");
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to accept invitation");
    } finally {
      setIsAccepting(false);
    }
  };

  // Handle reject invitation
  const handleReject = async () => {
    if (!pendingInvitation) return;

    try {
      await rejectInvitation({ collaborationId: pendingInvitation._id });
      toast.success("Invitation declined.");
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to decline invitation");
    }
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (permissions === undefined || pendingInvitation === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">
          Checking permissions...
        </div>
      </div>
    );
  }

  // Check permissions
  const hasPermission = (() => {
    switch (requiredPermission) {
      case "view":
        return permissions?.canView;
      case "edit":
        return permissions?.canEdit;
      case "manage":
        return permissions?.canManageCollaborators;
      default:
        return false;
    }
  })();

  // If user has permission, show the children
  if (hasPermission) {
    return <>{children}</>;
  }

  // If user doesn't have permission but has a pending invitation, show invite card
  if (pendingInvitation) {
    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Form Collaboration Invite
          </CardTitle>
          <CardDescription>
            You&apos;ve been invited to collaborate on this form
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Form:</span>
              <span className="text-sm">{pendingInvitation.formName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Role:</span>
              <Badge variant="secondary" className="ml-2">
                <Users className="h-3 w-3 mr-1" />
                {pendingInvitation.role}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Invited by:</span>
              <span className="text-sm">{pendingInvitation.invitedBy}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Invited on:</span>
              <span className="text-sm">
                {formatDate(pendingInvitation.invitedAt)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleAccept}
              disabled={isAccepting}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-1" />
              {isAccepting ? "Accepting..." : "Accept Invitation"}
            </Button>
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={isAccepting}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-1" />
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No permission and no pending invitation - show access denied
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Access Restricted
        </CardTitle>
        <CardDescription>
          {fallbackMessage ||
            `You don't have permission to ${requiredPermission} this form.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          Your current role: {permissions?.role || "none"}
        </div>
      </CardContent>
    </Card>
  );
}
