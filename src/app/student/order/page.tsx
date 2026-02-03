
"use client";

import MenuItemCard from '@/components/MenuItemCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Timer, AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useDoc, useUser } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { MenuItem, User } from '@/lib/data';

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
  const { user: authUser, isUserLoading } = useUser();

  const currentUserDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, "users", authUser.uid);
  }, [firestore, authUser]);

  const { data: student, isLoading: isLoadingStudent } = useDoc<User>(currentUserDocRef);
  
  const menuItemsCollection = useMemoFirebase(() => {
    if (!firestore || !student?.schoolId) return null;
    // Multi-tenant filter: Only get items for THIS student's school
    return query(collection(firestore, "menuItems"), where("schoolId", "==", student.schoolId));
  }, [firestore, student?.schoolId]);
  
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
      setShopOpen(true);
    }
  }, [appSettings]);


  if (isLoadingMenu || isLoadingSettings || isLoadingStudent || isUserLoading) {
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
        
        {!student?.schoolId && (
            <Alert variant="destructive" className="mb-8">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>School Not Assigned</AlertTitle>
                <AlertDescription>
                    Your account is not linked to a school. Please contact your administrator.
                </AlertDescription>
            </Alert>
        )}

        {appSettings?.stopOrders ? (
          <StopOrdersAlert />
        ) : appSettings ? (
          <OrderTimer settings={appSettings} />
        ) : null}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {menuItems && menuItems.length > 0 ? (
                menuItems.map(item => (
                    <MenuItemCard key={item.id} item={item} isShopOpen={shopOpen} />
                ))
            ) : student?.schoolId ? (
                <div className="col-span-full text-center py-20 bg-muted/30 rounded-xl border-2 border-dashed">
                    <p className="text-xl font-semibold text-muted-foreground">The menu for your school is currently empty.</p>
                    <p className="text-sm text-muted-foreground mt-2">Check back soon for tasty updates!</p>
                </div>
            ) : null}
        </div>
      </section>
    </div>
  );
}
