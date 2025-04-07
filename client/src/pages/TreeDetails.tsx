import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Tree } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const TreeDetails = () => {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  
  const { data: tree, isLoading, error } = useQuery<Tree>({
    queryKey: [`/api/trees/${id}`],
  });
  
  const goBack = () => {
    navigate('/');
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error || !tree) {
    return (
      <div className="container mx-auto px-4 py-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Tree Not Found</h2>
        <p className="mb-6">The tree you're looking for doesn't exist or there was an error.</p>
        <Button onClick={goBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="outline" 
        className="mb-6" 
        onClick={goBack}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Gallery
      </Button>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <motion.div 
          className="flex flex-col lg:flex-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="lg:w-1/2">
            <motion.img 
              src={tree.image} 
              alt={tree.name} 
              className="w-full h-80 lg:h-[500px] object-cover"
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="lg:w-1/2 p-6 lg:p-8">
            <motion.h1 
              className="font-display text-3xl font-bold mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {tree.name}
            </motion.h1>
            <motion.p 
              className="text-gray-600 italic mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {tree.scientificName}
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-2 mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {tree.categories.map((category, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-neutral-200 rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 className="font-bold text-lg mb-2">Description</h2>
              <p className="mb-6 text-gray-700">{tree.description}</p>
              
              <h2 className="font-bold text-lg mb-2">Location</h2>
              <p className="text-gray-700">{tree.location}</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TreeDetails;
