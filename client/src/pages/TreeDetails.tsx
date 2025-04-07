import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Tree } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MapPin, Leaf, Info } from 'lucide-react';

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
      <div className="flex justify-center items-center min-h-screen bg-neutral-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
      </div>
    );
  }
  
  if (error || !tree) {
    return (
      <div className="container mx-auto px-4 py-16 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4">Tree Not Found</h2>
        <p className="mb-8 text-lg text-gray-600">The tree you're looking for doesn't exist or there was an error.</p>
        <Button 
          onClick={goBack}
          size="lg"
          className="rounded-full"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Return to Gallery
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-neutral-50 min-h-screen pb-16">
      {/* Hero image section */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full"
        >
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${tree.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />
        </motion.div>
        
        <div className="absolute top-8 left-6 z-10">
          <Button 
            variant="outline" 
            className="rounded-full bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            onClick={goBack}
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Back
          </Button>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
                {tree.name}
              </h1>
              <p className="text-xl md:text-2xl text-white/80 italic">
                {tree.scientificName}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Content section */}
      <div className="container mx-auto px-4 -mt-12 relative z-10">
        <motion.div 
          className="bg-white rounded-xl shadow-lg overflow-hidden"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="p-6 md:p-10">
            <div className="flex flex-wrap gap-2 mb-8">
              {tree.categories.map((category, index) => (
                <span 
                  key={index}
                  className="px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold"
                >
                  {category}
                </span>
              ))}
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <Info className="w-6 h-6 text-emerald-600 mr-3" />
                  <h2 className="font-display text-2xl font-bold">Description</h2>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {tree.description}
                </p>
              </div>
              
              <div>
                <div className="flex items-center mb-4">
                  <MapPin className="w-6 h-6 text-emerald-600 mr-3" />
                  <h2 className="font-display text-2xl font-bold">Location</h2>
                </div>
                <p className="text-gray-700 text-lg mb-6">
                  {tree.location}
                </p>
                
                <div className="flex items-center mb-4">
                  <Leaf className="w-6 h-6 text-emerald-600 mr-3" />
                  <h2 className="font-display text-2xl font-bold">Plant Family</h2>
                </div>
                <p className="text-gray-700 text-lg italic">
                  {tree.scientificName.split(' ')[0]}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TreeDetails;
