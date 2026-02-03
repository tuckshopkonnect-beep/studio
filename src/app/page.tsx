"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, CreditCard, ShoppingBag, CheckCircle, Shield, BookUser, Mail, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const heroImages = [
  "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=2787&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1594007654729-407eedc4be65?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518311297794-ec7298ffba64?q=80&w=2010&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=2070&auto=format&fit=crop"
];

export default function Home() {
  const words = ["Simplified.", "Seamless.", "Effortless.", "Efficient.", "Smart.", "Intuitive."];
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Slideshow logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Typewriter effect logic
  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => setReverse(true), 2000); // Pause before deleting
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 50 : 150);

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse]);

  const features = [
    {
      icon: <CreditCard className="w-8 h-8 text-primary" />,
      title: "Secure Payments",
      description: "Top-up wallets using our secure Paystack integration. Fast, safe, and reliable.",
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Spending Controls",
      description: "Parents can set daily spending limits for their children, promoting financial literacy.",
    },
    {
      icon: <BookUser className="w-8 h-8 text-primary" />,
      title: "Easy Management",
      description: "A powerful dashboard for admins to manage orders, users, and menu items effortlessly.",
    },
  ];

  const testimonials = [
      {
        name: "Mrs. Adebayo",
        role: "Parent",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d",
        quote: "Tuckshop Konnect has been a lifesaver! I can easily fund my son's account and I love the ability to set daily spending limits. No more lost lunch money!"
      },
      {
        name: "Alex Doe",
        role: "Student, SS2",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026706d",
        quote: "Ordering my lunch is so much faster now. I just pick what I want in the morning and grab it at break time. The personalized recommendations are pretty cool too."
      },
      {
        name: "Admin User",
        role: "School Administrator",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
        quote: "Managing the tuckshop has never been more efficient. The reports are detailed, and inventory tracking is a breeze. It has completely modernized our operations."
      }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    },
    viewport: { once: true }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <AnimatePresence initial={false}>
              <motion.div 
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 1.15 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 bg-black/60 z-10" />
                <Image
                  src={heroImages[currentImageIndex]}
                  alt="School tuckshop food"
                  fill
                  priority
                  className="object-cover"
                  data-ai-hint="tuckshop food"
                />
                <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-gradient-to-t from-background to-transparent z-20" />
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="relative z-30 container px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <h1 className="text-4xl md:text-7xl font-bold tracking-tighter mb-6 drop-shadow-2xl leading-tight min-h-[1.5em]">
                School Lunch, <span className="text-accent italic inline-block min-w-[200px]">
                  {words[index].substring(0, subIndex)}
                  <span className="inline-block w-[2px] h-[0.8em] bg-accent ml-1 animate-pulse" />
                </span>
              </h1>
              <p className="text-lg md:text-2xl text-white/90 max-w-3xl mx-auto mb-10 drop-shadow-md font-medium">
                A modern, cashless solution for school tuckshops. Easy for students, peace of mind for parents, and efficient for schools.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full group shadow-xl hover:shadow-primary/20 transition-all duration-300" asChild>
                  <Link href="/schools">
                    <Utensils className="mr-2 group-hover:scale-110 transition-transform" /> Go to Portal
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 rounded-full transition-all duration-300" asChild>
                  <Link href="#how-it-works">
                    Learn More
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 text-white/70"
          >
            <span className="text-xs uppercase tracking-widest font-semibold">Scroll Down</span>
            <div className="animate-bounce">
                <ArrowRight className="rotate-90 w-6 h-6" />
            </div>
          </motion.div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-32 bg-background scroll-mt-10 relative">
          <div className="container px-4">
            <motion.div 
              {...fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">How It Works</h2>
              <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">A seamless experience in three simple steps.</p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-12 md:gap-16 text-center"
            >
              <motion.div variants={fadeInUp} className="flex flex-col items-center gap-6 group">
                <div className="bg-primary/10 p-6 rounded-full border-2 border-primary/20 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <CreditCard className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">1. Fund Wallet</h3>
                <p className="text-muted-foreground text-lg">Parents securely add funds to their child's account using Paystack. Fast, safe, and reliable.</p>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex flex-col items-center gap-6 group">
                <div className="bg-primary/10 p-6 rounded-full border-2 border-primary/20 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <ShoppingBag className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">2. Place Order</h3>
                <p className="text-muted-foreground text-lg">Students browse the menu and place their orders from any device. No more long queues.</p>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex flex-col items-center gap-6 group">
                <div className="bg-primary/10 p-6 rounded-full border-2 border-primary/20 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <CheckCircle className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">3. Collect Meal</h3>
                <p className="text-muted-foreground text-lg">Students collect their pre-paid meal at the tuckshop. No cash, no fuss, just food.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-32 bg-muted/50 overflow-hidden relative">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-blob" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
            </div>

            <div className="container px-4 grid md:grid-cols-2 gap-16 items-center relative z-10">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="space-y-6"
                >
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Everything You Need for a Modern Tuckshop</h2>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        From payments to inventory, our platform is designed to make school lunch programs easier for everyone involved—students, parents, and school staff.
                    </p>
                    <Button size="lg" asChild className="rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <Link href="/portal/admin">Admin Dashboard &rarr;</Link>
                    </Button>
                </motion.div>

                <motion.div 
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="whileInView"
                  viewport={{ once: true }}
                  className="grid gap-8"
                >
                    {features.map((feature, index) => (
                        <motion.div 
                          key={index}
                          variants={fadeInUp}
                          whileHover={{ scale: 1.02, x: 10 }}
                          className="flex items-start gap-6 bg-background p-6 rounded-2xl shadow-sm border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300"
                        >
                            <div className="bg-primary/10 p-4 rounded-xl shrink-0">
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground text-lg leading-snug">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-20 md:py-32 bg-background">
            <div className="container px-4">
                <motion.div 
                  {...fadeInUp}
                  className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Loved by Parents, Students, and Schools</h2>
                </motion.div>

                <motion.div 
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="whileInView"
                  viewport={{ once: true }}
                  className="grid lg:grid-cols-3 gap-8"
                >
                    {testimonials.map((testimonial) => (
                        <motion.div 
                            key={testimonial.name} 
                            variants={fadeInUp}
                            whileHover={{ y: -10 }}
                            className="h-full"
                        >
                          <Card className="flex flex-col h-full border-none shadow-md bg-muted/30 hover:bg-muted/50 transition-all duration-300 hover:shadow-xl">
                              <CardContent className="pt-8 flex-grow">
                                  <p className="text-muted-foreground italic text-lg leading-relaxed">"{testimonial.quote}"</p>
                              </CardContent>
                              <CardHeader className="flex-row items-center gap-4 pt-4 border-t border-border/50 mx-6 mb-6">
                                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                      <CardTitle className="text-lg font-bold">{testimonial.name}</CardTitle>
                                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                  </div>
                              </CardHeader>
                          </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 md:py-32 bg-primary text-primary-foreground relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl animate-blob" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl animate-blob animation-delay-4000" />
            </div>

            <motion.div 
              {...fadeInUp}
              className="container px-4 text-center relative z-10"
            >
                <div className="mx-auto bg-white/20 p-6 rounded-full w-fit mb-8 backdrop-blur-sm animate-pulse">
                    <Mail className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Ready to Get Started?</h2>
                <p className="text-primary-foreground/80 mt-6 text-xl max-w-2xl mx-auto leading-relaxed">
                    Join the many schools modernizing their tuckshop experience. For inquiries, support, or a demo, reach out to us.
                </p>
                <div className="mt-10">
                    <Button size="lg" variant="secondary" className="h-14 px-10 text-lg font-bold rounded-full group shadow-2xl hover:shadow-white/10 hover:-translate-y-1 transition-all duration-300" asChild>
                        <a href="mailto:tuckshopkonnect@gmail.com">
                          Contact Us Today <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </Button>
                </div>
            </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
