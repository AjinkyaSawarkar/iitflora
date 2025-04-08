import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTreeSchema, SimplifiedBloggerPost, BloggerResponse, BloggerPost } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import axios from "axios";

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

  // Helper functions for Blogger API
  const extractFirstImageUrl = (html: string): string | undefined => {
    const imgRegex = /<img[^>]+src="([^">]+)"/;
    const match = html.match(imgRegex);
    return match ? match[1] : undefined;
  };

  const processBloggerPosts = (posts: BloggerPost[]): SimplifiedBloggerPost[] => {
    return posts.map(post => {
      // Extract first image if any
      const firstImageUrl = post.images && post.images.length > 0 
        ? post.images[0].url 
        : extractFirstImageUrl(post.content);
      
      return {
        id: post.id,
        title: post.title,
        content: post.content,
        published: post.published,
        url: post.url,
        author: post.author.displayName,
        authorImage: post.author.image?.url,
        image: firstImageUrl,
        labels: post.labels || [],
      };
    });
  };

  // Blogger API endpoint
  app.get("/api/blogger", async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.VITE_BLOGGER_API_KEY;
      const blogId = "4965945072048572230"; // Fixed blog ID as requested
      const maxResults = 50; // Fetch more posts for better filtering

      if (!apiKey) {
        console.error("Blogger API key is missing");
        return res.status(500).json({ message: "Blogger API key is missing" });
      }

      const apiUrl = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?key=${apiKey}&maxResults=${maxResults}`;
      
      const response = await axios.get<BloggerResponse>(apiUrl);
      const blogPosts = response.data.items ? processBloggerPosts(response.data.items) : [];
      
      res.json(blogPosts);
    } catch (error) {
      console.error("Error fetching from Blogger API:", error);
      res.status(500).json({ 
        message: "Failed to fetch blog posts",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
