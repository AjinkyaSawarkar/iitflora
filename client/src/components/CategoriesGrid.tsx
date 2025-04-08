import { motion } from "framer-motion";
import { useLocation } from "wouter";

// Define the plant categories with simpler tags for better matching
export const plantCategories = [
  {
    id: "avenue-trees",
    title: "Avenue Trees",
    description: "Trees suitable for lining streets and avenues",
    image: "https://source.unsplash.com/random/600x400/?avenue,trees",
    tag: "avenue", // Simple keyword for matching
  },
  {
    id: "fruit-trees",
    title: "Fruit Trees",
    description: "Trees that bear edible fruits",
    image: "https://source.unsplash.com/random/600x400/?fruit,trees",
    tag: "fruit", // Simple keyword for matching
  },
  {
    id: "sacred-medicinal",
    title: "Sacred and Medicinal Trees",
    description: "Trees with religious significance or medicinal properties",
    image: "https://source.unsplash.com/random/600x400/?medicinal,trees",
    tag: "medicinal", // Simple keyword for matching
  },
  {
    id: "palms-specimen",
    title: "Palms and Specimen Plants",
    description: "Decorative palms and unique specimen plants",
    image: "https://source.unsplash.com/random/600x400/?palm,trees",
    tag: "palm", // Simple keyword for matching
  },
  {
    id: "shrubs-ground-covers",
    title: "Shrubs and Ground Covers",
    description: "Plants that cover the ground or form short hedges",
    image: "https://source.unsplash.com/random/600x400/?shrubs",
    tag: "shrub", // Simple keyword for matching
  },
  {
    id: "creepers",
    title: "Creepers",
    description: "Plants that grow along surfaces or climb",
    image: "https://source.unsplash.com/random/600x400/?creepers,vines",
    tag: "creeper", // Simple keyword for matching
  },
  {
    id: "medicinal-aromatic",
    title: "Medicinal and Aromatic Herbs",
    description: "Herbs with medicinal properties or pleasant aromas",
    image: "https://source.unsplash.com/random/600x400/?medicinal,herbs",
    tag: "herb", // Simple keyword for matching
  },
  {
    id: "biodiversity",
    title: "Biodiversity Plantation",
    description: "Plants that support and enhance biodiversity",
    image: "https://source.unsplash.com/random/600x400/?biodiversity,plants",
    tag: "biodiversity", // Simple keyword for matching
  },
  {
    id: "fruit-bearing",
    title: "Fruit Bearing Trees",
    description: "Trees that produce fruits for consumption",
    image: "https://source.unsplash.com/random/600x400/?fruit,bearing,trees",
    tag: "fruit", // Simple keyword for matching
  },
];

const CategoriesGrid = () => {
  const [, navigate] = useLocation();

  return (
    <div className="py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
        {plantCategories.map((category, index) => (
          <motion.div
            key={category.id}
            className="flex flex-col items-center cursor-pointer"
            onClick={() => navigate(`/category/${category.id}`)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <h3 className="text-xl font-medium mb-3 text-center">
              {category.title}
            </h3>
            <div className="text-xs text-gray-500 mb-3 text-center">
              A few images displaying in a justified grid.
            </div>
            <div className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 bg-white w-full">
              <img
                src={category.image}
                alt={category.title}
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesGrid;
