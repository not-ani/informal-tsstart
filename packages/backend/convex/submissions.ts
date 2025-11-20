/*
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const answerValueValidator = v.union(
  v.string(), // Short text, Paragraph, Date, Time, Linear Scale, Dropdown, Radio
  v.array(v.string()), // Checkboxes (list of selected strings)
  v.id("_storage"), // File Upload (reference to Convex file storage)
  // Grids
  v.object({
    gridData: v.array(
      v.object({
        row: v.string(),
        cols: v.array(v.string()),
      })
    ),
  })
);

export const submit = mutation({
  args: {
    formId: v.id("forms"),
    answers: v.array(
      v.object({
        questionId: v.string(),
        value: answerValueValidator,
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    // Check if form exists and requires auth
    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error("Form not found");
    }

    if (form.defaultRequired && !identity) {
      throw new Error("This form requires authentication to submit");
    }

    const submissionId = await ctx.db.insert("", {
      formId: args.formId,
      responderId: identity?.subject,
      submittedAt: Date.now(),
      answers: args.answers,
    });

    return submissionId;
  },
});

export const getByForm = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to view submissions");
    }

    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error("Form not found");
    }

    if (form.creatorId !== identity.subject) {
      throw new Error(
        "You do not have permission to view submissions for this form"
      );
    }

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .order("desc")
      .collect();

    return submissions;
  },
});

export const getMySubmission = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const submission = await ctx.db
      .query("submissions")
      .withIndex("by_form_responder", (q) =>
        q.eq("formId", args.formId).eq("responderId", identity.subject)
      )
      .first();

    return submission;
  },
});
*/
