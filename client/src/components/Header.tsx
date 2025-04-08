import { useState } from 'react';
import { Link } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Tree } from '@shared/schema';
import { Search, Rss } from 'lucide-react';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const { data: searchResults, isLoading } = useQuery<Tree[]>({
    queryKey: [searchQuery ? `/api/trees/search/${searchQuery}` : ''],
    enabled: searchQuery.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      setShowResults(true);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="w-8 h-8 text-primary mr-3"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 18V7c0-1 1-2 2-2h6c1 0 2 1 2 2v11m-5-7h0M12 8v10m-5 0h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <Link href="/">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-neutral-800 cursor-pointer">
              Campus Tree Blog
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4 mb-4 md:mb-0 md:order-3">
          <Link href="/" className="flex items-center text-neutral-800 hover:text-primary font-medium transition-colors">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              className="w-5 h-5 mr-1"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Categories</span>
          </Link>
          
          <Link href="/blog" className="flex items-center text-neutral-800 hover:text-primary font-medium transition-colors">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              className="w-5 h-5 mr-1"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>All Plants</span>
          </Link>
          
          <Link href="/trees" className="flex items-center text-neutral-800 hover:text-primary font-medium transition-colors">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              className="w-5 h-5 mr-1"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span>Tree Database</span>
          </Link>
        </div>
        
        <div className="relative w-full md:w-64 md:order-2">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search trees..."
              className="w-full py-2 px-4 pr-10 border border-gray-300 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              <Search className="h-5 w-5" />
            </Button>
          </form>
          
          {showResults && searchResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-auto">
              {searchResults.map((tree) => (
                <Link key={tree.id} href={`/tree/${tree.id}`} className="block p-2 hover:bg-gray-100 cursor-pointer">
                  <div className="font-medium">{tree.name}</div>
                  <div className="text-sm text-gray-500">{tree.scientificName}</div>
                </Link>
              ))}
            </div>
          )}
          
          {showResults && searchQuery && searchResults?.length === 0 && !isLoading && (
            <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 p-2">
              No results found
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
