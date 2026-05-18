import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, ShieldCheck, Truck, CreditCard, Sparkles, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ReturnPolicy = () => {
  const sections = [
    {
      icon: RefreshCw,
      title: "30-Day Easy Returns & Exchanges",
      description: "We want you to be completely satisfied with your purchase. If a product does not meet your expectations, you can request a return or exchange within 30 days of delivery. The item must be unused, unwashed, and in its original packaging with all tags attached.",
    },
    {
      icon: ShieldCheck,
      title: "Quality Check & Verification",
      description: "Once your return request is approved, our courier partner will pick up the package. Upon arrival at our warehouse, each product undergoes a detailed quality check to verify its condition. We process refunds immediately after verification.",
    },
    {
      icon: Truck,
      title: "Free Reverse Pickup",
      description: "We offer complimentary reverse pickup services across 20,000+ pincodes in India. There are absolutely no return shipping charges! Simply package the item securely and hand it to our authorized courier executive.",
    },
    {
      icon: CreditCard,
      title: "Instant Refunds",
      description: "For Cash on Delivery (COD) orders, refunds are credited directly to your bank account or as store credits within 5-7 business days of warehouse receipt. Online payments are refunded back to the original payment source within 48 hours of verification.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-1 container mx-auto py-16 px-4 max-w-4xl">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-10 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>BACK TO HOME</span>
        </Link>

        {/* Hero Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2"
          >
            <Sparkles size={12} className="text-gold" />
            <span>Praisomart Care</span>
          </motion.div>
          
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Returns & Exchanges
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
            Simple, transparent, and worry-free. Our customer-first policy ensures you shop with absolute confidence.
          </p>
        </div>

        {/* Policy Grid */}
        <div className="grid gap-8 mb-16">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col sm:flex-row gap-6 p-8 rounded-[2rem] border bg-card shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <Icon size={24} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {section.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Non-Returnable Items Alert */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="p-8 rounded-[2rem] bg-amber-50 border border-amber-200/50 text-amber-900 mb-16"
        >
          <h4 className="font-display font-bold text-lg mb-2 flex items-center gap-2">
            ⚠️ Non-Returnable Items
          </h4>
          <p className="text-sm leading-relaxed text-amber-800/90">
            For hygiene and health standards, certain products such as custom-tailored apparel, innerwear, and jewelry are non-returnable. Gift cards and promotional items purchased during mega clearance sales are final sale.
          </p>
        </motion.div>

        {/* Need Help CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-10 rounded-[2.5rem] bg-[#0B3D2E] text-white text-center relative overflow-hidden border border-gold/30 shadow-xl"
        >
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-gold/5 -mr-12 -mt-12 blur-2xl" />
          <div className="relative z-10 space-y-6">
            <div className="w-14 h-14 rounded-full bg-gold/10 text-gold flex items-center justify-center mx-auto">
              <MessageSquare size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold">Have questions or need to file a return?</h3>
              <p className="text-white/60 text-sm max-w-sm mx-auto">
                Our support experts are available 24/7. Reach out via email or call us directly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="mailto:support@praisomart.in" className="px-8 py-3.5 bg-gold text-[#0B3D2E] font-bold rounded-2xl hover:bg-gold-light transition-all text-sm shadow-lg">
                Email Support
              </a>
              <Link to="/contact" className="px-8 py-3.5 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all text-sm border border-white/10">
                Contact Us Page
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default ReturnPolicy;
