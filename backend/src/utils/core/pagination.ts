import mongoose from "mongoose";

interface PaginateOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
}

// Utility function for pagination with optional population
export async function paginateQuery<T>(
  model: mongoose.Model<T>,
  query: any = {},
  populate?:
    | string
    | string[]
    | mongoose.PopulateOptions
    | mongoose.PopulateOptions[],
  options: PaginateOptions = {},
) {
  // Sanitize page and limit values
  const p = Math.max(1, Number(options.page) || 1);
  const l = Math.min(
    options.maxLimit || 100,
    Math.max(1, Number(options.limit) || 20),
  );

  // Build query with pagination
  let q: mongoose.Query<any[], T> = model
    .find(query)
    .skip((p - 1) * l)
    .limit(l);

  // Handle optional population
  if (populate) {
    if (typeof populate === "string") {
      q = q.populate(populate);
    } else if (Array.isArray(populate)) {
      q = q.populate(populate as (string | mongoose.PopulateOptions)[]);
    } else {
      q = q.populate(populate);
    }
  }

  // Run queries in parallel for performance
  const [items, total] = await Promise.all([
    q.lean(),
    model.countDocuments(query),
  ]);

  // Return paginated result
  return {
    items,
    total,
    page: p,
    limit: l,
    pages: Math.ceil(total / l),
  };
}
