/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as collaborators from "../collaborators.js";
import type * as form_fields from "../form_fields.js";
import type * as form_responses from "../form_responses.js";
import type * as forms from "../forms.js";
import type * as healthCheck from "../healthCheck.js";
import type * as privateData from "../privateData.js";
import type * as submissions from "../submissions.js";
import type * as todos from "../todos.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  collaborators: typeof collaborators;
  form_fields: typeof form_fields;
  form_responses: typeof form_responses;
  forms: typeof forms;
  healthCheck: typeof healthCheck;
  privateData: typeof privateData;
  submissions: typeof submissions;
  todos: typeof todos;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
