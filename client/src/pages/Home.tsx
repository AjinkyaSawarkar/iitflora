import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Tree } from '@shared/schema';
import PhotoStack from '@/components/PhotoStack';
import FilterMenu from '@/components/FilterMenu';
import TreeGallery from '@/components/TreeGallery';
import { Button } from '@/components/ui/button';

const Home = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const { data: trees, isLoading, error } = useQuery<Tree[]>({
    queryKey: ['/api/trees'],
  });
  
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };
  
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#2E7D32] to-[#8BC34A] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-display text-3xl md:text-5xl font-bold mb-4"
              >
                Discover Our Campus Greenery
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg mb-6 opacity-90"
              >
                Explore the diverse collection of trees and plants that make our campus beautiful and sustainable.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Button 
                  className="bg-white text-primary hover:bg-neutral-100 transition duration-300 rounded-full"
                  onClick={() => {
                    document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore Gallery
                </Button>
              </motion.div>
            </div>
            <motion.div 
              className="md:w-1/2 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {trees && <PhotoStack trees={trees} />}
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Filter Menu */}
      <FilterMenu onFilterChange={handleFilterChange} />
      
      {/* Gallery Section */}
      <section className="py-12 bg-neutral-100">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold mb-8 text-center">Campus Tree Gallery</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
