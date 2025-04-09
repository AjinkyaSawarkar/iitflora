import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';
import { insertTreeSchema } from '@shared/schema';
import { fromZodError } from 'zod-validation-error';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        if (req.query.id) {
          const id = parseInt(req.query.id as string);
          if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid tree ID' });
          }
          const tree = await storage.getTreeById(id);
          if (!tree) {
            return res.status(404).json({ message: 'Tree not found' });
          }
          return res.json(tree);
        } else if (req.query.category) {
          const trees = await storage.getTreesByCategory(req.query.category as string);
          return res.json(trees);
        } else if (req.query.search) {
          const trees = await storage.searchTrees(req.query.search as string);
          return res.json(trees);
        } else {
          const trees = await storage.getAllTrees();
          return res.json(trees);
        }

      case 'POST':
        const result = insertTreeSchema.safeParse(req.body);
        if (!result.success) {
          const validationError = fromZodError(result.error);
          return res.status(400).json({ message: validationError.message });
        }
        const newTree = await storage.createTree(result.data);
        return res.status(201).json(newTree);

      default:
        res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
} 