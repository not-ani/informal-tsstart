import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const questionValidator = v.union(
  // 1. Simple Input Types (Short answer, Paragraph, Date, Time)
  v.object({
    id: v.string(),
    type: v.union(
      v.literal("short_text"),
      v.literal("paragraph"),
      v.literal("date"),
      v.literal("time")
    ),
    title: v.string(),
    required: v.boolean(),
  }),

  // 2. Selection Types (Multiple choice, Checkboxes, Dropdown)
  v.object({
    id: v.string(),
    type: v.union(
      v.literal("multiple_choice"),
      v.literal("checkboxes"),
      v.literal("dropdown")
    ),
    title: v.string(),
    required: v.boolean(),
    options: v.array(v.string()),
    hasOtherOption: v.boolean(), // "Other: ____" field support
  }),

  // 3. Linear Scale (e.g., 1 to 5)
  v.object({
    id: v.string(),
    type: v.literal("linear_scale"),
    title: v.string(),
    required: v.boolean(),
    min: v.number(), // e.g., 1
    max: v.number(), // e.g., 5
    minLabel: v.optional(v.string()), // e.g., "Worst"
    maxLabel: v.optional(v.string()), // e.g., "Best"
  }),

  // 4. Grids (Multiple choice grid, Checkbox grid)
  v.object({
    id: v.string(),
    type: v.union(
      v.literal("multiple_choice_grid"),
      v.literal("checkbox_grid")
    ),
    title: v.string(),
    required: v.boolean(),
    rows: v.array(v.string()),
    columns: v.array(v.string()),
  }),

  // 5. File Upload
  v.object({
    id: v.string(),
    type: v.literal("file_upload"),
    title: v.string(),
    required: v.boolean(),
    maxFileSize: v.number(), // In bytes
    allowedMimeTypes: v.optional(v.array(v.string())),
  })
);

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    requiresAuth: v.boolean(),
    questions: v.array(questionValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to create a form");
    }

    const formId = await ctx.db.insert("forms", {
      title: args.title,
      description: args.description,
      creatorId: identity.subject, // Using the subject as the creator ID
      requiresAuth: args.requiresAuth,
      createdAt: Date.now(),
      questions: args.questions,
    });

    return formId;
  },
});

export const get = query({
  args: { id: v.id("forms") },
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.id);
    if (!form) {
      throw new Error("Form not found");
    }
    return form;
  },
});

export const getByCreator = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const forms = await ctx.db
      .query("forms")
      .withIndex("by_creator", (q) => q.eq("creatorId", identity.subject))
      .order("desc")
      .collect();

    return forms;
  },
});

export const update = mutation({
  args: {
    id: v.id("forms"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    requiresAuth: v.optional(v.boolean()),
    questions: v.optional(v.array(questionValidator)),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to update a form");
    }

    const form = await ctx.db.get(args.id);
    if (!form) {
      throw new Error("Form not found");
    }

    if (form.creatorId !== identity.subject) {
      throw new Error("You do not have permission to update this form");
    }

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.requiresAuth !== undefined)
      updates.requiresAuth = args.requiresAuth;
    if (args.questions !== undefined) updates.questions = args.questions;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const deleteForm = mutation({
  args: {
    id: v.id("forms"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to delete a form");
    }

    const form = await ctx.db.get(args.id);
    if (!form) {
      throw new Error("Form not found");
    }

    if (form.creatorId !== identity.subject) {
      throw new Error("You do not have permission to delete this form");
    }

    await ctx.db.delete(args.id);
  },
});
