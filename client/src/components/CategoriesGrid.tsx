import { motion } from "framer-motion";
import { useLocation } from "wouter";

// Define the plant categories
export const plantCategories = [
  {
    id: "avenue-trees",
    title: "Avenue Trees",
    description: "Trees suitable for lining streets and avenues",
    image: "https://source.unsplash.com/random/600x400/?avenue,trees", // Placeholder image
    tag: "Avenue Trees"
  },
  {
    id: "fruit-trees",
    title: "Fruit Trees",
    description: "Trees that bear edible fruits",
    image: "https://source.unsplash.com/random/600x400/?fruit,trees", // Placeholder image
    tag: "Fruit trees"
  },
  {
    id: "sacred-medicinal",
    title: "Sacred and Medicinal Trees",
    description: "Trees with religious significance or medicinal properties",
    image: "https://source.unsplash.com/random/600x400/?medicinal,trees", // Placeholder image
    tag: "Sacred and medicinal trees"
  },
  {
    id: "palms-specimen",
    title: "Palms and Specimen Plants",
    description: "Decorative palms and unique specimen plants",
    image: "https://source.unsplash.com/random/600x400/?palm,trees", // Placeholder image
    tag: "Palms and specimen plants"
  },
  {
    id: "shrubs-ground-covers",
    title: "Shrubs and Ground Covers",
    description: "Plants that cover the ground or form short hedges",
    image: "https://source.unsplash.com/random/600x400/?shrubs", // Placeholder image
    tag: "Shrubs and ground covers"
  },
  {
    id: "creepers",
    title: "Creepers",
    description: "Plants that grow along surfaces or climb",
    image: "https://source.unsplash.com/random/600x400/?creepers,vines", // Placeholder image
    tag: "Creepers"
  },
  {
    id: "medicinal-aromatic",
    title: "Medicinal and Aromatic Herbs",
    description: "Herbs with medicinal properties or pleasant aromas",
    image: "https://source.unsplash.com/random/600x400/?medicinal,herbs", // Placeholder image
    tag: "Medicinal and Aromatic Herbs"
  },
  {
    id: "biodiversity",
    title: "Biodiversity Plantation",
    description: "Plants that support and enhance biodiversity",
    image: "https://source.unsplash.com/random/600x400/?biodiversity,plants", // Placeholder image
    tag: "Biodiversity plantation"
  },
  {
    id: "fruit-bearing",
    title: "Fruit Bearing Trees",
    description: "Trees that produce fruits for consumption",
    image: "https://source.unsplash.com/random/600x400/?fruit,bearing,trees", // Placeholder image
    tag: "Fruit bearing trees"
  }
];

const CategoriesGrid = () => {
  const [, navigate] = useLocation();

  return (
    <div className="max-w-[1800px] mx-auto px-4 py-12 bg-gray-50">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-light tracking-tight mb-3">Plant Categories</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our diverse collection of campus trees and plants organized by categories.
          Click on any category to view the detailed collection.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plantCategories.map((category, index) => (
          <motion.div
            key={category.id}
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigate(`/category/${category.id}`)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.03,
              transition: { duration: 0.2 }
            }}
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img 
                src={category.image} 
                alt={category.title} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              />
            </div>
            <div className="p-5">
              <h3 className="text-xl font-medium mb-2">{category.title}</h3>
              <p className="text-gray-600 text-sm">{category.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesGrid;