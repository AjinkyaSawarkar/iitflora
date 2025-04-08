import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Tree } from '@shared/schema';
import PhotoStack from '@/components/PhotoStack';
import FilterMenu from '@/components/FilterMenu';
import TreeGallery from '@/components/TreeGallery';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

const Home = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const { data: trees, isLoading, error } = useQuery<Tree[]>({
    queryKey: ['/api/trees'],
  });
  
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const scrollToGallery = () => {
    document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <>
      {/* Hero Section with Featured Slideshow */}
      <section className="relative bg-black overflow-hidden">
        {/* Full-width slideshow background */}
        <div className="absolute inset-0 w-full h-full">
          {trees && trees.length > 0 && <PhotoStack trees={trees} />}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80"></div>
        </div>
        
        <div className="relative container mx-auto px-4 pt-40 pb-32 h-screen flex flex-col justify-center">
          <div className="max-w-2xl mx-auto text-center text-white">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="font-display text-4xl md:text-6xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-emerald-300 to-green-500 text-transparent bg-clip-text">
                Discover Our Campus Greenery
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-xl mb-8 text-white/90"
            >
              Explore the diverse collection of trees and plants that make our campus beautiful and sustainable.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Button 
                className="bg-white/90 hover:bg-white text-emerald-800 hover:text-emerald-950 font-semibold px-8 py-6 rounded-full text-lg"
                onClick={scrollToGallery}
              >
                Browse All Trees
              </Button>
            </motion.div>
          </div>
          
          {/* Scroll indicator */}
          <motion.div 
            className="absolute bottom-10 left-0 right-0 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <button 
              onClick={scrollToGallery}
              className="text-white/80 hover:text-white flex flex-col items-center"
            >
              <span className="mb-2">Explore Gallery</span>
              <ChevronDown className="w-6 h-6 animate-bounce" />
            </button>
          </motion.div>
        </div>
      </section>
      
      {/* Filter Menu */}
      <FilterMenu onFilterChange={handleFilterChange} />
      
      {/* Gallery Section */}
      <section id="gallery" className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-10 text-center">
            <span className="border-b-4 border-emerald-500 pb-2">Campus Tree Gallery</span>
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              An error occurred while loading trees
            </div>
          ) : trees && trees.length > 0 ? (
            <TreeGallery trees={trees} activeFilter={activeFilter} />
          ) : (
            <div className="text-center text-gray-500">
              No trees found
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Home;
