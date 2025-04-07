import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTreeSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for trees
  app.get("/api/trees", async (req: Request, res: Response) => {
    try {
      const trees = await storage.getAllTrees();
      res.json(trees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trees" });
    }
  });

  app.get("/api/trees/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tree ID" });
      }
      
      const tree = await storage.getTreeById(id);
      if (!tree) {
        return res.status(404).json({ message: "Tree not found" });
      }
      
      res.json(tree);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tree" });
    }
  });

  app.get("/api/trees/category/:category", async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      const trees = await storage.getTreesByCategory(category);
      res.json(trees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trees by category" });
    }
  });

  app.get("/api/trees/search/:query", async (req: Request, res: Response) => {
    try {
      const query = req.params.query;
      const trees = await storage.searchTrees(query);
      res.json(trees);
    } catch (error) {
      res.status(500).json({ message: "Failed to search trees" });
    }
  });

  app.post("/api/trees", async (req: Request, res: Response) => {
    try {
      const result = insertTreeSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const newTree = await storage.createTree(result.data);
      res.status(201).json(newTree);
    } catch (error) {
      res.status(500).json({ message: "Failed to create tree" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
