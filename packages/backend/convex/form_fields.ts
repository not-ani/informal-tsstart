import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "number"
  | "date"
  | "time"
  | "MCQ"
  | "checkbox"
  | "file";

export const addField = mutation({
  args: {
    formId: v.string(),
    name: v.string(),
    type: v.string(),
    order: v.number(),
    required: v.boolean(),
    selectOptions: v.optional(
      v.array(
        v.object({
          name: v.string(),
          order: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    const form = await ctx.db
      .query("forms")
      .filter((q) => q.eq(q.field("_id"), args.formId))
      .unique();
    if (!form || form.createdBy !== identity.email) {
      throw new Error("Form not found");
    }
    const newFormId = await ctx.db.insert("form_fields", {
      ...args,
      type: args.type as FieldType,
    });
    return newFormId;
  },
});

export const deleteField = mutation({
  args: {
    fieldId: v.id("form_fields"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    const field = await ctx.db
      .query("form_fields")
      .filter((q) => q.eq(q.field("_id"), args.fieldId))
      .unique();
    if (!field) {
      throw new Error("Field not found");
    }
    const form = await ctx.db
      .query("forms")
      .filter((q) => q.eq(q.field("_id"), field.formId))
      .unique();
    if (!form || form.createdBy !== identity.email) {
      throw new Error("Form not found");
    }

    await ctx.db.delete(args.fieldId);

    // maintain order
    const fields = await ctx.db
      .query("form_fields")
      .filter((q) =>
        q.and(
          q.eq(q.field("formId"), field.formId),
          q.gt(q.field("order"), field.order)
        )
      )
      .collect();
    for (const f of fields) {
      await ctx.db.patch(f._id, {
        order: f.order - 1,
      });
    }
  },
});

export const getFormFields = query({
  args: {
    formId: v.string(),
  },
  handler: async (ctx, args) => {
    const fields = await ctx.db
      .query("form_fields")
      .withIndex("by_formId", (q) => q.eq("formId", args.formId))
      .collect();
    return fields.sort((a, b) => a.order - b.order);
  },
});

export const updateField = mutation({
  args: {
    fieldId: v.id("form_fields"),
    formId: v.id("forms"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    order: v.optional(v.number()),
    required: v.optional(v.boolean()),
    selectOptions: v.optional(
      v.array(
        v.object({
          name: v.string(),
          order: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    const field = await ctx.db
      .query("form_fields")
      .withIndex("by_id", (q) => q.eq("_id", args.fieldId))
      .unique();
    if (!field) {
      throw new Error("Field not found");
    }
    const form = await ctx.db
      .query("forms")
      .withIndex("by_id", (q) => q.eq("_id", args.formId))
      .unique();

    if (!form || form.createdBy !== identity.email) {
      throw new Error("Form not found");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fieldId, formId, ...updates } = args;

    // Define a type for the data to be patched, ensuring it matches the schema expectations
    type FormFieldPatchData = {
      name?: string;
      type?: FieldType;
      order?: number;
      required?: boolean;
      selectOptions?: { name: string; order: number }[];
    };

    const updateData: FormFieldPatchData = {};

    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    if (updates.type !== undefined) {
      updateData.type = updates.type as FieldType; // Cast here after undefined check
    }
    if (updates.order !== undefined) {
      updateData.order = updates.order;
    }
    if (updates.required !== undefined) {
      updateData.required = updates.required;
    }
    if (updates.selectOptions !== undefined) {
      updateData.selectOptions = updates.selectOptions;
    }

    if (Object.keys(updateData).length > 0) {
      await ctx.db.patch(args.fieldId, updateData);
    }
  },
});
