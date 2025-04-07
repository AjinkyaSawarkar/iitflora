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
