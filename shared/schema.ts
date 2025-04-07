import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const trees = pgTable("trees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  scientificName: text("scientific_name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  image: text("image").notNull(),
  categories: text("categories").array().notNull(),
});

export const insertTreeSchema = createInsertSchema(trees).omit({
  id: true,
});

export type InsertTree = z.infer<typeof insertTreeSchema>;
export type Tree = typeof trees.$inferSelect;

// Blogger API types
export interface BloggerAuthor {
  id: string;
  displayName: string;
  url: string;
  image?: {
    url: string;
  };
}

export interface BloggerImage {
  url: string;
}

export interface BloggerPost {
  kind: string;
  id: string;
  blog: {
    id: string;
  };
  published: string;
  updated: string;
  url: string;
  selfLink: string;
  title: string;
  content: string;
  author: BloggerAuthor;
  replies: {
    totalItems: string;
    selfLink: string;
  };
  images?: BloggerImage[];
  labels?: string[];
}

export interface BloggerResponse {
  kind: string;
  items: BloggerPost[];
  etag: string;
}

// Simplified blogger post type for our application
export interface SimplifiedBloggerPost {
  id: string;
  title: string;
  content: string;
  published: string;
  url: string;
  author: string;
  authorImage?: string;
  image?: string;
  labels?: string[];
}
