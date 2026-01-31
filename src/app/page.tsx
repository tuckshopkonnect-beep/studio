import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, CreditCard, ShoppingBag, CheckCircle, Shield, SlidersHorizontal, BookUser, Twitter, Instagram, Facebook, Mail, ArrowRight } from 'lucide-react';
import { menuItems } from '@/lib/data';
import MenuItemCard from '@/components/MenuItemCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Footer from '@/components/Footer';

export default function Home() {
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
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-black/60 z-10" />
              <Image
                src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2787&auto=format&fit=crop"
                alt="Delicious food background"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          </div>
          <div className="relative z-20 container px-4 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-shadow-lg">
              School Lunch, Simplified.
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8 text-shadow">
              A modern, cashless solution for school tuckshops. Easy for students, peace of mind for parents, and efficient for schools.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/schools">
                  <Utensils className="mr-2" /> Go to Portal
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How It Works</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">A seamless experience in three simple steps.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 md:gap-12 text-center">
              <div className="flex flex-col items-center gap-4 animate-in fade-in-0 slide-in-from-bottom-10 duration-500">
                <div className="bg-primary/10 p-4 rounded-full border-2 border-primary/20">
                  <CreditCard className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">1. Fund Wallet</h3>
                <p className="text-muted-foreground">Parents securely add funds to their child's account using Paystack.</p>
              </div>
              <div className="flex flex-col items-center gap-4 animate-in fade-in-0 slide-in-from-bottom-10 duration-500 animation-delay-200">
                <div className="bg-primary/10 p-4 rounded-full border-2 border-primary/20">
                  <ShoppingBag className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">2. Place Order</h3>
                <p className="text-muted-foreground">Students browse the menu and place their orders from any device.</p>
              </div>
              <div className="flex flex-col items-center gap-4 animate-in fade-in-0 slide-in-from-bottom-10 duration-500 animation-delay-400">
                <div className="bg-primary/10 p-4 rounded-full border-2 border-primary/20">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">3. Collect Meal</h3>
                <p className="text-muted-foreground">Students collect their pre-paid meal at the tuckshop. No cash, no fuss.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-muted/50">
            <div className="container px-4 grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything You Need for a Modern Tuckshop</h2>
                    <p className="text-lg text-muted-foreground">
                        From payments to inventory, our platform is designed to make school lunch programs easier for everyone involved.
                    </p>
                </div>
                <div className="grid gap-6">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <div className="bg-background p-3 rounded-lg shadow-sm">
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-16 md:py-24 bg-background">
            <div className="container px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Loved by Parents, Students, and Schools</h2>
                </div>
                <div className="grid lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
                        <Card key={testimonial.name} className="flex flex-col">
                            <CardContent className="pt-6 flex-grow">
                                <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                            </CardContent>
                            <CardHeader className="flex-row items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-base">{testimonial.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 md:py-24 bg-muted/50">
            <div className="container px-4 text-center">
                <Mail className="mx-auto h-12 w-12 text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-4">Have Questions?</h2>
                <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                    For inquiries, support, or feedback, please reach out to the development team at <a href="mailto:tuckshopkonnect@gmail.com" className="font-semibold text-primary hover:underline">tuckshopkonnect@gmail.com</a>.
                </p>
            </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
