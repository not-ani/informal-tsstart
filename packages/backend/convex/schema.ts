import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
  forms: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    creatorId: v.string(),
    requiresAuth: v.boolean(),
    createdAt: v.number(),

    // We use a union to enforce strict shapes for different question types
    questions: v.array(
      v.union(
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
      )
    ),
  }).index("by_creator", ["creatorId"]),

  submissions: defineTable({
    formId: v.id("forms"),
    responderId: v.optional(v.string()), // User ID if authed, null if anon
    submittedAt: v.number(),

    answers: v.array(
      v.object({
        questionId: v.string(),
        // The value shape changes based on the question type
        value: v.union(
          v.string(), // Short text, Paragraph, Date, Time, Linear Scale, Dropdown, Radio
          v.array(v.string()), // Checkboxes (list of selected strings)
          v.id("_storage"), // File Upload (reference to Convex file storage)

          // Grids: An object mapping row names to selected column value(s)
          // We store JSON strings here or strictly defined objects.
          // For strict schema typing, we use an object where keys are row indices/ids.
          v.object({
            // Key: Row Label, Value: Column Label (or array of cols for checkbox grid)
            gridData: v.array(
              v.object({
                row: v.string(),
                cols: v.array(v.string()),
              })
            ),
          })
        ),
      })
    ),
  })
    .index("by_form", ["formId"])
    .index("by_form_responder", ["formId", "responderId"]),
});
