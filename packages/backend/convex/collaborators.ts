import { ConvexError, v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

async function checkFormPermission(
  ctx: QueryCtx | MutationCtx,
  formId: Id<"forms">,
  requiredRole: "owner" | "editor" | "viewer" = "viewer"
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.email) {
    throw new ConvexError("Not authenticated");
  }

  const form = await ctx.db.get(formId);
  if (!form) {
    throw new ConvexError("Form not found");
  }

  if (form.createdBy === identity.email) {
    return {
      hasPermission: true,
      role: "owner" as const,
      userEmail: identity.email,
    };
  }

  const collaboration = await ctx.db
    .query("form_collaborators")
    .withIndex("by_formId_and_userEmail", (q) =>
      q.eq("formId", formId).eq("userEmail", identity.email!)
    )
    .filter((q) => q.eq(q.field("status"), "accepted"))
    .unique();

  if (!collaboration) {
    throw new ConvexError("You don't have permission to access this form");
  }

  const roleHierarchy: Record<"owner" | "editor" | "viewer", number> = {
    owner: 3,
    editor: 2,
    viewer: 1,
  };
  const userRoleLevel = roleHierarchy[collaboration.role];
  const requiredRoleLevel = roleHierarchy[requiredRole];

  if (userRoleLevel < requiredRoleLevel) {
    throw new ConvexError(
      `Insufficient permissions. Required: ${requiredRole}, You have: ${collaboration.role}`
    );
  }

  return {
    hasPermission: true,
    role: collaboration.role,
    userEmail: identity.email,
  };
}

export const inviteCollaborator = mutation({
  args: {
    formId: v.id("forms"),
    userEmail: v.string(),
    role: v.union(v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const { userEmail } = await checkFormPermission(ctx, args.formId, "owner");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.userEmail)) {
      throw new ConvexError("Invalid email format");
    }

    if (args.userEmail === userEmail) {
      throw new ConvexError("You cannot invite yourself");
    }

    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new ConvexError("Form not found");
    }

    if (args.userEmail === form.createdBy) {
      throw new ConvexError("Form creator is already the owner");
    }

    const existingCollaboration = await ctx.db
      .query("form_collaborators")
      .withIndex("by_formId_and_userEmail", (q) =>
        q.eq("formId", args.formId).eq("userEmail", args.userEmail)
      )
      .unique();

    if (existingCollaboration) {
      if (existingCollaboration.status === "pending") {
        throw new ConvexError("Invitation already sent to this user");
      } else if (existingCollaboration.status === "accepted") {
        throw new ConvexError("User is already a collaborator");
      } else {
        await ctx.db.delete(existingCollaboration._id);
      }
    }

    const collaborationId = await ctx.db.insert("form_collaborators", {
      formId: args.formId,
      userEmail: args.userEmail,
      role: args.role,
      status: "pending",
      invitedBy: userEmail,
      invitedAt: Date.now(),
    });

    return collaborationId;
  },
});

export const acceptInvitation = mutation({
  args: {
    collaborationId: v.id("form_collaborators"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      throw new ConvexError("Not authenticated");
    }

    const collaboration = await ctx.db.get(args.collaborationId);
    if (!collaboration) {
      throw new ConvexError("Invitation not found");
    }

    if (collaboration.userEmail !== identity.email) {
      throw new ConvexError("You can only accept your own invitations");
    }

    if (collaboration.status !== "pending") {
      throw new ConvexError("Invitation has already been responded to");
    }

    await ctx.db.patch(args.collaborationId, {
      status: "accepted",
      respondedAt: Date.now(),
    });

    return null;
  },
});

export const rejectInvitation = mutation({
  args: {
    collaborationId: v.id("form_collaborators"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      throw new ConvexError("Not authenticated");
    }

    const collaboration = await ctx.db.get(args.collaborationId);
    if (!collaboration) {
      throw new ConvexError("Invitation not found");
    }

    if (collaboration.userEmail !== identity.email) {
      throw new ConvexError("You can only reject your own invitations");
    }

    if (collaboration.status !== "pending") {
      throw new ConvexError("Invitation has already been responded to");
    }

    await ctx.db.patch(args.collaborationId, {
      status: "rejected",
      respondedAt: Date.now(),
    });

    return null;
  },
});

export const removeCollaborator = mutation({
  args: {
    collaborationId: v.id("form_collaborators"),
  },
  handler: async (ctx, args) => {
    const collaboration = await ctx.db.get(args.collaborationId);
    if (!collaboration) {
      throw new ConvexError("Collaborator not found");
    }
    await checkFormPermission(ctx, collaboration.formId, "owner");

    await ctx.db.delete(args.collaborationId);
    return null;
  },
});

export const updateCollaboratorRole = mutation({
  args: {
    collaborationId: v.id("form_collaborators"),
    newRole: v.union(v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const collaboration = await ctx.db.get(args.collaborationId);
    if (!collaboration) {
      throw new ConvexError("Collaborator not found");
    }

    await checkFormPermission(ctx, collaboration.formId, "owner");

    if (collaboration.status !== "accepted") {
      throw new ConvexError("Can only update role for accepted collaborators");
    }

    await ctx.db.patch(args.collaborationId, {
      role: args.newRole,
    });

    return null;
  },
});

export const listCollaborators = query({
  args: {
    formId: v.id("forms"),
  },
  handler: async (ctx, args) => {
    await checkFormPermission(ctx, args.formId, "viewer");

    const collaborators = await ctx.db
      .query("form_collaborators")
      .withIndex("by_formId", (q) => q.eq("formId", args.formId))
      .collect();

    return collaborators;
  },
});

export const getFormPermissions = query({
  args: {
    formId: v.id("forms"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      return {
        canView: false,
        canEdit: false,
        canManageCollaborators: false,
        role: "none" as const,
      };
    }

    try {
      const permission = await checkFormPermission(ctx, args.formId, "viewer");

      return {
        canView: true,
        canEdit: permission.role === "owner" || permission.role === "editor",
        canManageCollaborators: permission.role === "owner",
        role: permission.role,
      };
    } catch (error) {
      if (error instanceof ConvexError) {
        return {
          canView: false,
          canEdit: false,
          canManageCollaborators: false,
          role: "none" as const,
        };
      }
      throw error;
    }
  },
});

export const getPendingInvitations = query({
  args: {
    formId: v.optional(v.id("forms")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      return [];
    }
    let pendingInvitations;

    if (args.formId) {
      pendingInvitations = await ctx.db
        .query("form_collaborators")
        .withIndex("by_userEmail_and_status", (q) =>
          q.eq("userEmail", identity.email!).eq("status", "pending")
        )
        .filter((q) => q.eq(q.field("formId"), args.formId))
        .collect();
    } else {
      pendingInvitations = await ctx.db
        .query("form_collaborators")
        .withIndex("by_userEmail_and_status", (q) =>
          q.eq("userEmail", identity.email!).eq("status", "pending")
        )
        .collect();
    }

    const enrichedInvitations = await Promise.all(
      pendingInvitations.map(async (invitation) => {
        const form = await ctx.db.get(invitation.formId);
        return {
          _id: invitation._id,
          formId: invitation.formId,
          formName: form?.name ?? "Untitled Form",
          role: invitation.role,
          invitedBy: invitation.invitedBy,
          invitedAt: invitation.invitedAt,
        };
      })
    );

    return enrichedInvitations;
  },
});

export const getPendingInvitationForForm = query({
  args: {
    formId: v.id("forms"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      return null;
    }

    const pendingInvitation = await ctx.db
      .query("form_collaborators")
      .withIndex("by_formId_and_userEmail", (q) =>
        q.eq("formId", args.formId).eq("userEmail", identity.email!)
      )
      .filter((q) => q.eq(q.field("status"), "pending"))
      .unique();

    if (!pendingInvitation) {
      return null;
    }

    const form = await ctx.db.get(args.formId);
    return {
      _id: pendingInvitation._id,
      formId: pendingInvitation.formId,
      formName: form?.name ?? "Untitled Form",
      role: pendingInvitation.role,
      invitedBy: pendingInvitation.invitedBy,
      invitedAt: pendingInvitation.invitedAt,
    };
  },
});

export const getUserAccessibleForms = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity?.email) {
      return [];
    }

    const ownedForms = await ctx.db
      .query("forms")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", identity.email!))
      .collect();
    const collaborations = await ctx.db
      .query("form_collaborators")
      .withIndex("by_userEmail_and_status", (q) =>
        q.eq("userEmail", identity.email!).eq("status", "accepted")
      )
      .collect();
    const collaboratedForms = await Promise.all(
      collaborations.map(async (collab) => {
        const form = await ctx.db.get(collab.formId);
        return form ? { ...form, userRole: collab.role } : null;
      })
    );

    const allForms = [
      ...ownedForms.map((form) => ({ ...form, userRole: "owner" as const })),
      ...collaboratedForms.filter(
        (form): form is NonNullable<typeof form> => form !== null
      ),
    ];

    return allForms.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export { checkFormPermission };
