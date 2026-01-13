
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart.tsx';
import type { MenuItem } from '@/lib/data';
import { PlusCircle, Check, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface MenuItemCardProps {
  item: MenuItem;
  isShopOpen?: boolean;
}

export default function MenuItemCard({ item, isShopOpen = true }: MenuItemCardProps) {
  const { addToCart, getStock } = useCart();
  const [added, setAdded] = useState(false);

  const stock = getStock(item.id);
  const isInStock = stock > 0;

  const handleAddToCart = () => {
    if (!isInStock) return;
    addToCart(item);
    setAdded(true);
    setTimeout(() => {
        setAdded(false);
    }, 2000);
  };

  const isButtonDisabled = added || !isShopOpen || !isInStock;
  
  let buttonContent;
  if (!isShopOpen) {
    buttonContent = (
      <>
        <XCircle className="mr-2 h-4 w-4" />
        Shop Closed
      </>
    );
  } else if (!isInStock && isShopOpen) {
    buttonContent = (
      <>
        <XCircle className="mr-2 h-4 w-4" />
        Out of Stock
      </>
    );
  } else if (added) {
    buttonContent = (
      <>
        <Check className="mr-2 h-4 w-4" />
        Added!
      </>
    );
  } else {
    buttonContent = (
      <>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add to Order
      </>
    );
  }


  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={item.image.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint={item.image.imageHint}
          />
          {isShopOpen && (
            <Badge 
              variant={stock < 10 ? 'destructive' : 'secondary'}
              className="absolute top-2 right-2"
            >
              {stock} left
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="mb-1 text-lg font-headline">{item.name}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 bg-muted/50">
        <p className="text-xl font-bold text-primary">₦{item.price.toFixed(2)}</p>
        <Button onClick={handleAddToCart} size="sm" disabled={isButtonDisabled} variant={added ? "secondary" : "default"}>
           {buttonContent}
        </Button>
      </CardFooter>
    </Card>
  );
}
