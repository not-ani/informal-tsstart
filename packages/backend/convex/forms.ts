import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { checkFormPermission } from "./collaborators";

export const create = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity?.email) {
      throw new Error("Not authenticated");
    }

    const newFormId = await ctx.db.insert("forms", {
      createdBy: identity.email,
      name: "Untitled Form",
      description: "This is a description",
    });

    return newFormId;
  },
});

export const getFormContext = query({
  args: {
    formId: v.id("forms"),
  },
  handler: async (ctx, args) => {
    const form = await ctx.db
      .query("forms")
      .withIndex("by_id", (q) => q.eq("_id", args.formId))
      .unique();
    if (!form) {
      throw new Error("Form not found");
    }

    const fields = await ctx.db
      .query("form_fields")
      .withIndex("by_formId", (q) => q.eq("formId", args.formId))
      .collect();

    return {
      form,
      fields,
    };
  },
});

export const update = mutation({
  args: {
    formId: v.id("forms"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    authRequired: v.optional(v.boolean()),
    oneTime: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await checkFormPermission(ctx, args.formId, "editor");

    const { formId, ...updateFields } = args;

    // filter undefined because undefined values are not are deleted
    const updates = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(updateFields).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(formId, updates);
    }
  },
});

export const deleteForm = mutation({
  args: {
    formId: v.id("forms"),
  },
  handler: async (ctx, args) => {
    await checkFormPermission(ctx, args.formId, "owner");

    const formResponses = await ctx.db
      .query("form_responses")
      .filter((q) => q.eq(q.field("formId"), args.formId))
      .collect();
    if (formResponses?.length > 0) {
      throw new ConvexError("Form has responses - cannot delete");
    }

    const formFields = await ctx.db
      .query("form_fields")
      .filter((q) => q.eq(q.field("formId"), args.formId))
      .collect();
    for (const field of formFields) {
      await ctx.db.delete(field._id);
    }
    await ctx.db.delete(args.formId);
  },
});

export const get = query({
  args: {
    formId: v.id("forms"),
  },
  handler: async (ctx, args) => {
    const form = await ctx.db
      .query("forms")
      .withIndex("by_id", (q) => q.eq("_id", args.formId))
      .unique();
    if (!form) {
      throw new Error("Form not found");
    }
    return form;
  },
});

export const getUserForms = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    return ctx.db
      .query("forms")
      .filter((q) => q.eq(q.field("createdBy"), identity.email))
      .collect();
  },
});

export const submitResponse = mutation({
  args: {
    formId: v.id("forms"),
    formResponseValues: v.array(
      v.object({
        id: v.id("form_fields"),
        name: v.string(),
        value: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userEmail = identity?.email;

    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error("Form not found");
    }

    if (form.authRequired && !userEmail) {
      throw new Error("Authentication required for this form");
    }

    if (userEmail && !form.oneTime) {
      const existingApplication = await ctx.db
        .query("form_responses")
        .withIndex("by_userEmail_and_formId", (q) =>
          q.eq("userEmail", userEmail).eq("formId", args.formId)
        )
        .first();

      if (existingApplication) {
        throw new Error("You have already submitted a response for this form");
      }
    }

    const formFields = await ctx.db
      .query("form_fields")
      .withIndex("by_formId", (q) => q.eq("formId", args.formId))
      .collect();

    const fieldMap = new Map(formFields.map((field) => [field._id, field]));

    const requiredFields = formFields.filter((field) => field.required);
    const providedFieldIds = new Set(args.formResponseValues.map((v) => v.id));

    for (const requiredField of requiredFields) {
      if (!providedFieldIds.has(requiredField._id)) {
        throw new Error(`Required field "${requiredField.name}" is missing`);
      }
    }

    for (const response of args.formResponseValues) {
      const field = fieldMap.get(response.id);
      if (!field) {
        throw new Error(`Invalid field ID: ${response.id}`);
      }

      if (field.required && (!response.value || response.value.trim() === "")) {
        throw new Error(`Required field "${field.name}" cannot be empty`);
      }

      if (field.name !== response.name) {
        throw new Error(`Field name mismatch for field "${field.name}"`);
      }
    }

    const formResponseId = await ctx.db.insert("form_responses", {
      formId: args.formId,
      userEmail: userEmail || undefined,
    });

    for (const responseValue of args.formResponseValues) {
      await ctx.db.insert("field_responses", {
        formId: args.formId,
        fieldId: responseValue.id,
        formResponseId: formResponseId,
        userEmail: userEmail || undefined,
        response: responseValue.value.trim(),
      });
    }

    return formResponseId;
  },
});

export const checkFormOwnership = query({
  args: {
    formId: v.id("forms"),
  },
  handler: async (ctx, args) => {
    try {
      const permission = await checkFormPermission(ctx, args.formId, "viewer");
      return permission.role === "owner";
    } catch {
      return false;
    }
  },
});

export const deleteFormWithAllData = mutation({
  args: {
    formId: v.id("forms"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await checkFormPermission(ctx, args.formId, "owner");

    const fieldResponses = await ctx.db
      .query("field_responses")
      .withIndex("by_formId", (q) => q.eq("formId", args.formId))
      .collect();

    for (const fieldResponse of fieldResponses) {
      await ctx.db.delete(fieldResponse._id);
    }

    const formResponses = await ctx.db
      .query("form_responses")
      .withIndex("by_formId", (q) => q.eq("formId", args.formId))
      .collect();

    for (const formResponse of formResponses) {
      await ctx.db.delete(formResponse._id);
    }

    const formFields = await ctx.db
      .query("form_fields")
      .withIndex("by_formId", (q) => q.eq("formId", args.formId))
      .collect();

    for (const field of formFields) {
      await ctx.db.delete(field._id);
    }

    const collaborators = await ctx.db
      .query("form_collaborators")
      .withIndex("by_formId", (q) => q.eq("formId", args.formId))
      .collect();

    for (const collaborator of collaborators) {
      await ctx.db.delete(collaborator._id);
    }

    await ctx.db.delete(args.formId);

    return null;
  },
});
