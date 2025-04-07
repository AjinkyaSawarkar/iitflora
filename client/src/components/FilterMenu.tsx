import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface FilterMenuProps {
  onFilterChange: (filter: string) => void;
}

const FilterMenu = ({ onFilterChange }: FilterMenuProps) => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const filters = [
    { id: 'all', label: 'All Trees' },
    { id: 'deciduous', label: 'Deciduous' },
    { id: 'evergreen', label: 'Evergreen' },
    { id: 'flowering', label: 'Flowering' },
    { id: 'fruit', label: 'Fruit Trees' },
    { id: 'exotic', label: 'Exotic' },
    { id: 'native', label: 'Native' }
  ];
  
  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId);
    onFilterChange(filterId);
  };
  
  return (
    <section className="bg-white shadow-md sticky top-16 z-40" id="gallery">
      <div className="container mx-auto px-4">
        <div className="overflow-x-auto py-4 whitespace-nowrap">
          <div className="inline-flex space-x-2">
            {filters.map((filter) => (
              <motion.div
                key={filter.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={activeFilter === filter.id ? "default" : "outline"}
                  className={`rounded-full ${
                    activeFilter === filter.id
                      ? "bg-primary text-white"
                      : "bg-neutral-200 hover:bg-primary hover:text-white"
                  }`}
                  onClick={() => handleFilterClick(filter.id)}
                >
                  {filter.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FilterMenu;
