import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import categorySarees from "@/assets/category-sarees.jpg";
import categoryLeggings from "@/assets/category-leggings.jpg";
import categoryTops from "@/assets/category-tops.jpg";
import { useCategories } from "@/hooks/use-categories";


const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 60, rotateX: 10 },
  visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const CategoriesSection = () => {
  const { data: dbCategories } = useCategories();
  
  const categories = dbCategories?.map((c: any) => {
    let image = categorySarees;
    if (c.name.toLowerCase().includes("legging")) image = categoryLeggings;
    else if (c.name.toLowerCase().includes("top")) image = categoryTops;
    else if (c.imageUrl) image = c.imageUrl;

    return {
      name: c.name,
      image,
      href: `/category/${c.id}`,
      count: "Explore",
      desc: "Find your style",
    };
  }) || [
    { name: "Sarees", image: categorySarees, href: "/category/1", count: "200+ Designs", desc: "Handcrafted silk & cotton" },
    { name: "Leggings", image: categoryLeggings, href: "/category/2", count: "50+ Styles", desc: "Comfort meets style" },
    { name: "Tops", image: categoryTops, href: "/category/3", count: "100+ Pieces", desc: "Trendy ethnic tops" },
  ];

  return (
    <section className="py-24 px-4 bg-warm-bg overflow-hidden">
      <div className="container mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <motion.p
            className="text-sm font-semibold tracking-[0.3em] uppercase text-gold mb-3"
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.3em" }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            Explore
          </motion.p>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground">
            Our Collections
          </h2>
          <motion.div
            className="h-1 w-16 bg-gold mx-auto mt-6 rounded-full"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {categories.map((cat) => (
            <motion.div key={cat.name} variants={cardVariants}>
              <Link to={cat.href} className="group block relative rounded-3xl overflow-hidden aspect-[3/4]">
                <motion.img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent group-hover:from-foreground/90 transition-all duration-500" />
                
                {/* Hover glow effect */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "radial-gradient(circle at 50% 80%, hsla(43, 72%, 55%, 0.15), transparent 60%)" }}
                />

                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <motion.p
                    className="text-xs font-semibold tracking-[0.25em] uppercase text-gold-light mb-2"
                  >
                    {cat.count}
                  </motion.p>
                  <h3 className="font-display text-3xl font-bold text-primary-foreground mb-1">{cat.name}</h3>
                  <p className="text-sm text-primary-foreground/60 mb-4">{cat.desc}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 w-0 bg-gold group-hover:w-12 transition-all duration-500" />
                    <motion.div
                      className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm"
                    >
                      <ArrowUpRight size={14} className="text-gold" />
                    </motion.div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesSection;
