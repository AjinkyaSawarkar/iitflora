import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { CalendarIcon, User2Icon, TagIcon, ExternalLinkIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BloggerPost, BloggerResponse, SimplifiedBloggerPost } from '@shared/schema';

interface BloggerFeedProps {
  blogId: string;
  maxResults?: number;
  className?: string;
}

// This helper extracts the first image URL from the HTML content
const extractFirstImageUrl = (html: string): string | undefined => {
  const imgRegex = /<img[^>]+src="([^">]+)"/;
  const match = html.match(imgRegex);
  return match ? match[1] : undefined;
};

// This helper processes the Blogger posts into a simplified format
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

const BloggerFeed: React.FC<BloggerFeedProps> = ({ 
  blogId, 
  maxResults = 5,
  className = '' 
}) => {
  // API key setup - this will be provided by environment variable
  const apiKey = import.meta.env.VITE_BLOGGER_API_KEY;
  
  // Build the API URL
  const apiUrl = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?key=${apiKey}&maxResults=${maxResults}`;
  
  // Fetch blog posts with React Query
  const { 
    data, 
    isLoading, 
    error 
  } = useQuery<BloggerResponse>({
    queryKey: [`/blogger/${blogId}`],
    queryFn: async () => {
      // If no API key, show error
      if (!apiKey) {
        throw new Error('Blogger API key is missing. Please provide a valid API key.');
      }
      
      const response = await axios.get(apiUrl);
      return response.data;
    },
    enabled: !!apiKey, // Only run query if API key exists
  });
  
  // Process the blog posts
  const blogPosts = data?.items ? processBloggerPosts(data.items) : [];
  
  // Create a stripped version of HTML content (remove tags)
  const stripHtml = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };
  
  // Get excerpt from content (first 150 characters)
  const getExcerpt = (content: string, maxLength: number = 150): string => {
    const stripped = stripHtml(content);
    return stripped.length > maxLength 
      ? `${stripped.substring(0, maxLength)}...` 
      : stripped;
  };
  
  // Display skeleton loading state
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {Array(3).fill(0).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="h-48 bg-muted"></div>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-1/3" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  // Display error state
  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <CardHeader>
          <CardTitle className="text-red-500">Unable to load blog posts</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            {error instanceof Error 
              ? error.message 
              : 'An unknown error occurred while fetching blog posts.'}
          </p>
          {!apiKey && (
            <p className="mt-4 text-sm">
              Please make sure you have set the VITE_BLOGGER_API_KEY environment variable.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // If no posts found
  if (blogPosts.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <CardHeader>
          <CardTitle>No blog posts found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No posts were found for this blog. Please check your blog ID or try again later.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Display blog posts
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {blogPosts.map((post) => (
        <Card key={post.id} className="overflow-hidden flex flex-col h-full">
          {post.image && (
            <div className="relative h-48 overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          )}
          
          <CardHeader>
            <CardTitle className="line-clamp-2">{post.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(new Date(post.published), 'MMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-grow">
            <p className="text-muted-foreground">
              {getExcerpt(post.content)}
            </p>
            
            {post.labels && post.labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.labels.slice(0, 3).map((label, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    <TagIcon className="h-3 w-3 mr-1" />
                    {label}
                  </Badge>
                ))}
                {post.labels.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{post.labels.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {post.authorImage ? (
                <img 
                  src={post.authorImage} 
                  alt={post.author} 
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <User2Icon className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">{post.author}</span>
            </div>
            
            <Button size="sm" variant="outline" asChild>
              <a href={post.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                Read more
                <ExternalLinkIcon className="h-3 w-3 ml-1" />
              </a>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default BloggerFeed;