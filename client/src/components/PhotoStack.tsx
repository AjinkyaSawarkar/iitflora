import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Tree } from '@shared/schema';

interface PhotoStackProps {
  trees: Tree[];
}

const PhotoStack = ({ trees }: PhotoStackProps) => {
  const [selectedTrees, setSelectedTrees] = useState<Tree[]>([]);
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (trees && trees.length) {
      // Randomly select 5 trees for the photo stack
      const shuffled = [...trees].sort(() => 0.5 - Math.random());
      setSelectedTrees(shuffled.slice(0, 5));
    }
  }, [trees]);

  const handleCardClick = (treeId: number) => {
    setLocation(`/tree/${treeId}`);
  };

  return (
    <div className="relative w-full h-[500px] perspective-1000 md:h-[500px]">
      <AnimatePresence>
        {selectedTrees.map((tree, index) => (
          <motion.div
            key={tree.id}
            className="absolute w-[300px] h-[400px] rounded-lg shadow-lg overflow-hidden cursor-pointer"
            initial={{ 
              translateX: `${index * 30 - 60}px`, 
              translateY: `${index * 5}px`, 
              rotate: `${index * 2 - 5}deg`, 
              zIndex: index
            }}
            whileHover={{ 
              translateY: -10, 
              scale: 1.05, 
              zIndex: 100,
              transition: { duration: 0.3 }
            }}
            style={{
              backgroundImage: `url(${tree.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            onClick={() => handleCardClick(tree.id)}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-full hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-xl font-bold text-white">{tree.name}</h3>
                <p className="text-sm italic text-white/90">{tree.scientificName}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default PhotoStack;
