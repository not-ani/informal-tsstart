import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addResponse = mutation({
  args: {
    formId: v.id("forms"),
    responses: v.array(
      v.object({
        fieldId: v.id("form_fields"),
        response: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    const form = await ctx.db
      .query("forms")
      .withIndex("by_id", (q) => q.eq("_id", args.formId))
      .unique();
    if (!form) {
      throw new Error("Form not found");
    }
    const formResponseId = await ctx.db.insert("form_responses", {
      formId: form._id,
      userEmail: identity?.email,
    });
    for (const response of args.responses) {
      await ctx.db.insert("field_responses", {
        formId: form._id,
        formResponseId: formResponseId,
        fieldId: response.fieldId,
        response: response.response,
      });
    }
    return formResponseId;
  },
});

export const getFormResponses = query({
  args: {
    formId: v.id("forms"),
  },
  returns: v.array(
    v.object({
      _id: v.id("form_responses"),
      userEmail: v.optional(v.string()),
      _creationTime: v.number(),
      fieldResponses: v.array(
        v.object({
          _id: v.id("field_responses"),
          fieldId: v.id("form_fields"),
          response: v.union(v.string(), v.array(v.string())),
        })
      ),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return [];
    }

    const submissions = await ctx.db
      .query("form_responses")
      .withIndex("by_formId", (q) => q.eq("formId", args.formId))
      .order("desc")
      .collect();

    if (submissions.length === 0) {
      return [];
    }

    const formResponsesWithFields = await Promise.all(
      submissions.map(async (submission) => {
        const relatedFieldResponses = await ctx.db
          .query("field_responses")
          .withIndex("by_formResponseId", (q) =>
            q.eq("formResponseId", submission._id)
          )
          .collect();

        return {
          _id: submission._id,
          userEmail: submission.userEmail,
          _creationTime: submission._creationTime,
          fieldResponses: relatedFieldResponses.map((fr) => ({
            _id: fr._id,
            fieldId: fr.fieldId,
            response: fr.response,
          })),
        };
      })
    );

    return formResponsesWithFields;
  },
});

export const getDetailedFormResponses = query({
  args: {
    formId: v.id("forms"),
    search: v.optional(v.string()),
    field: v.optional(v.string()),
    fieldValue: v.optional(v.string()),
    date: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("form_responses"),
      userEmail: v.optional(v.string()),
      _creationTime: v.number(),
      fieldResponses: v.array(
        v.object({
          _id: v.id("field_responses"),
          fieldId: v.id("form_fields"),
          fieldName: v.string(),
          fieldType: v.string(),
          response: v.union(v.string(), v.array(v.string())),
        })
      ),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return [];
    }

    // Check permissions
    const form = await ctx.db.get(args.formId);
    if (!form || form.createdBy !== identity.email) {
      throw new Error("Unauthorized");
    }

    // Get all form fields for this form
    const formFields = await ctx.db
      .query("form_fields")
      .withIndex("by_formId", (q) => q.eq("formId", args.formId))
      .collect();

    const fieldMap = new Map(formFields.map((field) => [field._id, field]));

    // Helper for date filtering
    function matchesDateFilter(
      creationTime: number,
      date: string | undefined
    ): boolean {
      if (!date || date === "all") return true;
      const responseDate = new Date(creationTime);
      const now = new Date();
      switch (date) {
        case "today":
          return responseDate.toDateString() === now.toDateString();
        case "week": {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return responseDate >= weekAgo;
        }
        case "month": {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return responseDate >= monthAgo;
        }
        default:
          return true;
      }
    }

    let submissions;

    // Use optimized index when filtering by userEmail
    if (
      args.field === "userEmail" &&
      args.fieldValue &&
      args.fieldValue !== ""
    ) {
      submissions = await ctx.db
        .query("form_responses")
        .withIndex("by_formId_and_userEmail", (q) =>
          q.eq("formId", args.formId).eq("userEmail", args.fieldValue!)
        )
        .order("desc")
        .collect();
    } else {
      // Fetch all submissions for the form
      submissions = await ctx.db
        .query("form_responses")
        .withIndex("by_formId", (q) => q.eq("formId", args.formId))
        .order("desc")
        .collect();
    }

    // Apply date filtering once
    if (args.date && args.date !== "all") {
      submissions = submissions.filter((sub) =>
        matchesDateFilter(sub._creationTime, args.date)
      );
    }
    if (submissions.length === 0) {
      return [];
    }

    // For each submission, fetch and enrich field responses
    let formResponsesWithFields = await Promise.all(
      submissions.map(async (submission) => {
        const relatedFieldResponses = await ctx.db
          .query("field_responses")
          .withIndex("by_formResponseId", (q) =>
            q.eq("formResponseId", submission._id)
          )
          .collect();

        const enrichedFieldResponses = relatedFieldResponses.map((fr) => {
          const field = fieldMap.get(fr.fieldId);
          return {
            _id: fr._id,
            fieldId: fr.fieldId,
            fieldName: field?.name || "Unknown Field",
            fieldType: field?.type || "text",
            response: fr.response,
          };
        });

        return {
          _id: submission._id,
          userEmail: submission.userEmail,
          _creationTime: submission._creationTime,
          fieldResponses: enrichedFieldResponses,
        };
      })
    );

    // Apply remaining filters that couldn't be done at DB level
    if (args.search && args.search.trim() !== "") {
      const searchLower = args.search.toLowerCase();
      formResponsesWithFields = formResponsesWithFields.filter((response) => {
        const matchesEmail = response.userEmail
          ?.toLowerCase()
          .includes(searchLower);
        const matchesField = response.fieldResponses.some((fieldResponse) => {
          const responseText = Array.isArray(fieldResponse.response)
            ? fieldResponse.response.join(", ").toLowerCase()
            : (fieldResponse.response || "").toLowerCase();
          return (
            responseText.includes(searchLower) ||
            fieldResponse.fieldName.toLowerCase().includes(searchLower)
          );
        });
        return matchesEmail || matchesField;
      });
    }

    // Apply field/fieldValue filtering for non-userEmail fields
    if (
      args.field &&
      args.field !== "all" &&
      args.field !== "userEmail" &&
      args.fieldValue &&
      args.fieldValue !== ""
    ) {
      formResponsesWithFields = formResponsesWithFields.filter((response) => {
        return response.fieldResponses.some((fieldResponse) => {
          if (fieldResponse.fieldId !== args.field) return false;
          if (Array.isArray(fieldResponse.response)) {
            return fieldResponse.response.some((val) =>
              val.toLowerCase().includes(args.fieldValue!.toLowerCase())
            );
          } else {
            return (fieldResponse.response || "")
              .toLowerCase()
              .includes(args.fieldValue!.toLowerCase());
          }
        });
      });
    }

    return formResponsesWithFields;
  },
});
