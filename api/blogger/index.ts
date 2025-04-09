import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { SimplifiedBloggerPost, BloggerPost } from '@shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const apiKey = process.env.BLOGGER_API_KEY;
    const blogId = "4965945072048572230";
    const maxResults = 50;

    if (!apiKey) {
      console.error("Blogger API key is missing");
      return res.status(500).json({ message: "Blogger API key is missing" });
    }

    const apiUrl = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?key=${apiKey}&maxResults=${maxResults}`;
    
    const response = await axios.get(apiUrl);
    const blogPosts = response.data.items ? processBloggerPosts(response.data.items) : [];
    
    return res.json(blogPosts);
  } catch (error) {
    console.error("Error fetching from Blogger API:", error);
    return res.status(500).json({ 
      message: "Failed to fetch blog posts",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Helper functions
const extractFirstImageUrl = (html: string): string | undefined => {
  const imgRegex = /<img[^>]+src="([^">]+)"/;
  const match = html.match(imgRegex);
  return match ? match[1] : undefined;
};

const processBloggerPosts = (posts: BloggerPost[]): SimplifiedBloggerPost[] => {
  return posts.map(post => {
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