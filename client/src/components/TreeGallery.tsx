import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Tree } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface TreeGalleryProps {
  trees: Tree[];
  activeFilter: string;
}

const TreeGallery = ({ trees, activeFilter }: TreeGalleryProps) => {
  const [filteredTrees, setFilteredTrees] = useState<Tree[]>([]);
  
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredTrees(trees);
    } else {
      setFilteredTrees(trees.filter(tree => tree.categories.includes(activeFilter)));
    }
  }, [trees, activeFilter]);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <AnimatePresence>
        {filteredTrees.map((tree) => (
          <motion.div
            key={tree.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden h-full bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={tree.image} 
                  alt={tree.name} 
                  className="w-full h-full object-cover transition duration-500 hover:scale-110"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-display text-xl font-bold">{tree.name}</h3>
                <p className="text-sm text-gray-600 italic mb-2">{tree.scientificName}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {tree.categories.map((category, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-1 bg-neutral-200 rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                <Link href={`/tree/${tree.id}`}>
                  <Button 
                    variant="link" 
                    className="text-primary hover:text-accent transition flex items-center mt-2 p-0"
                  >
                    <span className="mr-2">View details</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TreeGallery;
