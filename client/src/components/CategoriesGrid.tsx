import { motion } from "framer-motion";
import { useLocation } from "wouter";

// Define the plant categories with simpler tags for better matching
export const plantCategories = [
  {
    id: "avenue-trees",
    title: "Avenue Trees",
    description: "Trees suitable for lining streets and avenues",
    image:
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgzLj_yBGWj0fm8HJqJLpiEB6_6SsWhRf-0tV9coYTJUY_o8IjHYSEVQGWOkmZ707qhSuXYHnKtwUrhMFG3EcVASggXjkHopzSB9vhc7IppIr4k-vaeLSfkr5uAkli-7XBrjc5uhPI_OUXhfDl9zp7wq6jSzyx4zbhbx-qhJoEieTGpt6k2tGJG4DxALS1p/s1280/avenue-tree.jpg",
    tag: "avenue", // Simple keyword for matching
  },
  {
    id: "fruit-trees",
    title: "Fruit Trees",
    description: "Trees that bear edible fruits",
    image:
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjCZs7Q8rZaMND6YydxS6kFU_UjcMHY8056fm_9M31-SK2ypC1KjCR_WcobL_Y5ZkjEs0etK_TDsOqWHY2i0PMqbkL6Yue6_liuDeYZOiTQTKlQTVMLdFziGFbfI2Ufcn5uEDnf-20YrMNVMwX9dDtZnruaG-09VDKMWsC88xAYUotp6HFHXgvBOz1omVsB/s1920/fruit-tree.jpeg",
    tag: "fruit", // Simple keyword for matching
  },
  {
    id: "sacred-medicinal",
    title: "Sacred and Medicinal Trees",
    description: "Trees with religious significance or medicinal properties",
    image:
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhuLTRSa8sm6_WS_03-c7DIrvrrjMbkBP5MQCC9xE_poNTpIuigRC_JOxUpOlAHKax1jIk7QHvNhBWxASpMVu0VrA5Exjqbo1HNh9FSLIs5OzgGQIAlEQahTs0eX2BNpCJfaCNuVzDWgBz2q9r_qzZtE3LrD5otUMHRt8gGm_8jxm5zsGngnTnM0whS4z9t/s600/sacred-tree.jpg",
    tag: "sacred", // Simple keyword for matching
  },
  {
    id: "palms-specimen",
    title: "Palms and Specimen Plants",
    description: "Decorative palms and unique specimen plants",
    image:
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEja6rxJdMRPqVeUrYKrWK_X5fq3T1ANlAABcS8WH79sBuqjLUEuYJG_QU8HUrensfNyDnQyuY42L7dyLNU6eq0iMJyoKlYZjsnVWcEvOpI542Aybc8mTULIsnUWhZR5yCM1MqEk2deXaaEUSKIzeptE4psjhWJDiXEvwPa4xmqZ9HUh1k-khbrClXSHfZIc/s1500/palm-tree.webp",
    tag: "palm", // Simple keyword for matching
  },
  {
    id: "shrubs-ground-covers",
    title: "Shrubs and Ground Covers",
    description: "Plants that cover the ground or form short hedges",
    image:
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgLovxRm-vU5nIAzcrFNLNEGbDWRAB_LbcZzCxhSlQOwlPbP8TiPDWDYS-zP1J-Yfk9p01RKE8ezqdEjyVV4fMHBhjvnZxoSsfGNx-Hzakg_uAzY4A-bW8R1nv0ROb7IaDQq-rm_AhvW2uwCPgefKemz91Kd5-0iDaNcE6Vk1ynu8tBQV7LN9wbuSpYt9lC/s1694/shrub.webp",
    tag: "shrub", // Simple keyword for matching
  },
  {
    id: "creepers",
    title: "Creepers",
    description: "Plants that grow along surfaces or climb",
    image:
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgc1x1aoEosco1zsVEGe0BSOsY2o4u9CaL-EygUo_r_1IyscaaXJJCebZgrobp-hkP3brJqLqzedu9vfVahOKAs4YD7SWQvjWRDMYCy17zeQj_rP0dY6U-TzONkP62bqR4-3StdKrTGlc7hTad6JaelTIxXrrJQMCTsB14G-R1Wb1lFCAEwAaKLMSy3RWg8/s1024/creepers.jpg",
    tag: "creeper", // Simple keyword for matching
  },
  {
    id: "medicinal-aromatic",
    title: "Medicinal and Aromatic Herbs",
    description: "Herbs with medicinal properties or pleasant aromas",
    image:
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjxE-mMGac73O5cY8Wd7mb4wkO7G3P1y-vjQQVHOmvwM2oQS8nrPcmR2-1R6xxQA9BpphcImqlgtVC-fHYhvIwW0-xZpX5OvvZlO2yiEquFrpicUyHzRyQZ9qNTqpKZclxfoGbsLDODzT-6jMUsKOh_sRglmblj1jEyIUPg8x05nHd5amqzKzpEC5N-KKUt/s1068/medicinal.jpg",
    tag: "aromatic", // Simple keyword for matching
  },
  {
    id: "biodiversity",
    title: "Biodiversity Plantation",
    description: "Plants that support and enhance biodiversity",
    image:
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjKEB31vtgiNbpJ__Ox3Idh83fnmW4gEXdeTEBYcDkXcAnYJx4KrtcMQnUt0PObsNaMTYIQeiYSyYVCYewBXD22b5CYDKqJhBHLpAyidXIq5xwlnQRtzits6v4euHy2VIS7a7ZVqg_5bs9lfbwqg-E2yTVh2Qozqzj8hk_SRzdC23C0Q8MS0arWpCp6nwIs/s1024/biodiversity.jpg",
    tag: "biodiversity", // Simple keyword for matching
  },
  {
    id: "fruit-bearing",
    title: "Fruit Bearing Trees",
    description: "Trees that produce fruits for consumption",
    image:
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhWnvHxaYAtNxOMy06Ei1Hr_tTXnPCsIPkuThUyqvqxdisw-9d_7nekWSQOOpg2vegTdu374hRM1KMCIz1ZRCmagMdh0daOhiVuZo6adLkYncmq9d08bQtixSlF3ssTQf7Aeg_2rGWq7ylJOOuz4lLjl_z-zWEJmjXP3crHoyQ9ZESzWOqAVHcq-C0SQCBo/s320/fruitbearing.jpg",
    tag: "bearing", // Simple keyword for matching
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
