import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
  forms: defineTable({
    createdBy: v.string(),
    defaultRequired: v.optional(v.boolean()),
    authRequired: v.optional(v.boolean()),
    oneTime: v.optional(v.boolean()),
    description: v.optional(v.string()),
    name: v.optional(v.string()),
  }).index("by_createdBy", ["createdBy"]),

  form_collaborators: defineTable({
    formId: v.id("forms"),
    userEmail: v.string(),
    role: v.union(v.literal("owner"), v.literal("editor"), v.literal("viewer")),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
    invitedBy: v.string(),
    invitedAt: v.number(),
    respondedAt: v.optional(v.number()),
  })
    .index("by_formId", ["formId"])
    .index("by_userEmail", ["userEmail"])
    .index("by_formId_and_userEmail", ["formId", "userEmail"])
    .index("by_userEmail_and_status", ["userEmail", "status"]),

  form_responses: defineTable({
    formId: v.id("forms"),
    userEmail: v.optional(v.string()),
  })
    .index("by_formId", ["formId"])
    .index("by_userEmail_and_formId", ["userEmail", "formId"])
    .index("by_formId_and_userEmail", ["formId", "userEmail"]),

  field_responses: defineTable({
    formId: v.id("forms"),
    fieldId: v.id("form_fields"),
    userEmail: v.optional(v.string()),
    formResponseId: v.id("form_responses"),
    response: v.union(v.string(), v.array(v.string())),
  })
    .index("by_formId", ["formId"])
    .index("by_fieldId", ["fieldId"])
    .index("by_formResponseId", ["formResponseId"])
    .index("by_formId_and_fieldId", ["formId", "fieldId"])
    .index("by_formId_and_fieldId_and_response", [
      "formId",
      "fieldId",
      "response",
    ]),
  form_fields: defineTable({
    formId: v.string(),
    default: v.optional(v.any()),
    name: v.string(),
    order: v.float64(),
    required: v.optional(v.boolean()),
    selectOptions: v.optional(
      v.array(
        v.object({
          name: v.string(),
          order: v.float64(),
        })
      )
    ),

    type: v.union(
      v.literal("text"),
      v.literal("textarea"),
      v.literal("select"),
      v.literal("number"),
      v.literal("date"),
      v.literal("time"),
      v.literal("MCQ"),
      v.literal("checkbox"),
      v.literal("file")
    ),
  }).index("by_formId", ["formId"]),
});
