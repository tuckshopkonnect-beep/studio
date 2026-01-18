
"use client";

import MenuItemCard from '@/components/MenuItemCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Timer, AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { MenuItem } from '@/lib/data';

interface AppSettings {
  orderTimerEnabled?: boolean;
  orderOpenTime?: string;
  orderCloseTime?: string;
  stopOrders?: boolean;
}

// --- StopOrdersAlert Component ---
const StopOrdersAlert = () => {
    return (
        <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>All Ordering is Temporarily Disabled</AlertTitle>
            <AlertDescription>
                The tuck shop is not accepting any new orders at this time. Please check back later.
            </AlertDescription>
        </Alert>
    );
};


// --- OrderTimer Component ---
const OrderTimer = ({ settings }: { settings: AppSettings }) => {
    const [countdown, setCountdown] = useState('');
    const [openTimeStr, setOpenTimeStr] = useState('');
    const [closeTimeStr, setCloseTimeStr] = useState('');
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        if (!settings.orderTimerEnabled) return;

        const openTimeValue = settings.orderOpenTime || '08:00';
        const closeTimeValue = settings.orderCloseTime || '14:00';
        
        const [openHour, openMinute] = openTimeValue.split(':').map(Number);
        const [closeHour, closeMinute] = closeTimeValue.split(':').map(Number);

        const formatTime = (h: number, m: number) => {
            const period = h >= 12 ? 'PM' : 'AM';
            const hour12 = h % 12 || 12;
            return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
        };
        
        setOpenTimeStr(formatTime(openHour, openMinute));
        setCloseTimeStr(formatTime(closeHour, closeMinute));

        const calculateTimer = () => {
            const now = new Date();
            
            const openTime = new Date();
            openTime.setHours(openHour, openMinute, 0, 0);
            
            const closeTime = new Date();
            closeTime.setHours(closeHour, closeMinute, 0, 0);

            let isShopOpen = now >= openTime && now < closeTime;
            setIsOpen(isShopOpen);
            
            let targetTime;
            let messagePrefix;

            if (now < openTime) {
                targetTime = openTime;
                messagePrefix = 'Opens in:';
            } else if (now >= closeTime) {
                targetTime = new Date(openTime.getTime() + 24 * 60 * 60 * 1000); // Tomorrow's opening
                messagePrefix = 'Opens in:';
            } else {
                targetTime = closeTime;
                messagePrefix = 'Closes in:';
            }

            const diff = targetTime.getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            const countdownStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            setCountdown(`${messagePrefix} ${countdownStr}`);
        };
        
        calculateTimer();
        const interval = setInterval(calculateTimer, 1000);

        return () => clearInterval(interval);
    }, [settings]);

    if (!settings.orderTimerEnabled) {
        return null; // Don't show anything if the timer is not enabled by the admin
    }

    return (
        <Alert variant={isOpen ? 'default' : 'destructive'} className="mb-8">
            <Timer className="h-4 w-4" />
            <AlertTitle>
                {isOpen ? 'Shop is Open!' : 'Shop is Currently Closed'}
            </AlertTitle>
            <AlertDescription>
                Orders are accepted between {openTimeStr} and {closeTimeStr}. {countdown}
            </AlertDescription>
        </Alert>
    );
};
// --- End OrderTimer Component ---

const MenuSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="flex flex-col overflow-hidden">
            <CardHeader className="p-0">
                <Skeleton className="h-48 w-full" />
            </CardHeader>
             <CardContent className="flex-grow p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2 mt-1" />
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 bg-muted/50">
                 <Skeleton className="h-8 w-1/4" />
                 <Skeleton className="h-9 w-2/4" />
            </CardFooter>
        </Card>
      ))}
    </div>
);


export default function OrderPage() {
  const firestore = useFirestore();
  
  const menuItemsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "menuItems");
  }, [firestore]);
  
  const { data: menuItems, isLoading: isLoadingMenu } = useCollection<MenuItem>(menuItemsCollection);

  const settingsDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, "settings", "global");
  }, [firestore]);

  const { data: appSettings, isLoading: isLoadingSettings } = useDoc<AppSettings>(settingsDocRef);
  
  const [shopOpen, setShopOpen] = useState(true);

  useEffect(() => {
    if (!appSettings) return;

    if (appSettings.stopOrders) {
      setShopOpen(false);
      return;
    }

    if (appSettings.orderTimerEnabled) {
      const checkShopStatus = () => {
        const openTimeValue = appSettings.orderOpenTime || '08:00';
        const closeTimeValue = appSettings.orderCloseTime || '14:00';
        const [openHour, openMinute] = openTimeValue.split(':').map(Number);
        const [closeHour, closeMinute] = closeTimeValue.split(':').map(Number);

        const now = new Date();
        const openTime = new Date();
        openTime.setHours(openHour, openMinute, 0, 0);
        const closeTime = new Date();
        closeTime.setHours(closeHour, closeMinute, 0, 0);

        setShopOpen(now >= openTime && now < closeTime);
      };
      
      checkShopStatus(); // Initial check
      const interval = setInterval(checkShopStatus, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    } else {
      // If timer is not enabled and orders are not stopped, shop is open
      setShopOpen(true);
    }
  }, [appSettings]);


  if (isLoadingMenu || isLoadingSettings) {
    return (
      <div className="container mx-auto p-4 py-8 md:p-6 md:py-12">
        <h1 className="text-4xl font-headline font-bold mb-8 text-center">Place a New Order</h1>
        <Skeleton className="h-16 w-full mb-8" />
        <MenuSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8 md:p-6 md:py-12">
      <section>
        <h1 className="text-4xl font-headline font-bold mb-8 text-center">Place a New Order</h1>
        
        {appSettings?.stopOrders ? (
          <StopOrdersAlert />
        ) : appSettings ? (
          <OrderTimer settings={appSettings} />
        ) : null}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {(menuItems || []).map(item => (
              <MenuItemCard key={(item as any).id} item={item} isShopOpen={shopOpen} />
            ))}
        </div>
      </section>
    </div>
  );
}
