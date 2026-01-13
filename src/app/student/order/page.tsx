
"use client";

import { menuItems } from '@/lib/data';
import MenuItemCard from '@/components/MenuItemCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Timer } from 'lucide-react';
import { useEffect, useState } from 'react';

// --- OrderTimer Component ---
const OrderTimer = () => {
    const [timerState, setTimerState] = useState({
        isEnabled: false,
        isOpen: false,
        countdown: '',
    });

    // Shop hours (8 AM to 2 PM)
    const openHour = 8;
    const closeHour = 14;

    useEffect(() => {
        const timerEnabled = localStorage.getItem('orderTimerEnabled') === 'true';

        if (!timerEnabled) {
            setTimerState({ isEnabled: false, isOpen: true, countdown: '' });
            return;
        }

        const calculateTimer = () => {
            const now = new Date();
            const currentHour = now.getHours();
            
            const openTime = new Date();
            openTime.setHours(openHour, 0, 0, 0);
            
            const closeTime = new Date();
            closeTime.setHours(closeHour, 0, 0, 0);

            let isOpen = currentHour >= openHour && currentHour < closeHour;
            let targetTime;
            let messagePrefix;

            if (currentHour < openHour) {
                // Before opening
                targetTime = openTime;
                messagePrefix = 'Opens in:';
            } else if (currentHour >= closeHour) {
                // After closing
                targetTime = new Date(openTime.getTime() + 24 * 60 * 60 * 1000); // Tomorrow's opening
                messagePrefix = 'Opens in:';
            } else {
                // During open hours
                targetTime = closeTime;
                messagePrefix = 'Closes in:';
            }

            const diff = targetTime.getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            const countdownStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            setTimerState({
                isEnabled: true,
                isOpen,
                countdown: `${messagePrefix} ${countdownStr}`,
            });
        };
        
        calculateTimer();
        const interval = setInterval(calculateTimer, 1000);

        return () => clearInterval(interval);
    }, []);

    if (!timerState.isEnabled) {
        return null; // Don't show anything if the timer is not enabled by the admin
    }

    return (
        <Alert variant={timerState.isOpen ? 'default' : 'destructive'} className="mb-8">
            <Timer className="h-4 w-4" />
            <AlertTitle>
                {timerState.isOpen ? 'Shop is Open!' : 'Shop is Currently Closed'}
            </AlertTitle>
            <AlertDescription>
                Orders are accepted between {openHour}:00 AM and {closeHour}:00 PM. {timerState.countdown}
            </AlertDescription>
        </Alert>
    );
};
// --- End OrderTimer Component ---

export default function OrderPage() {
  const [shopOpen, setShopOpen] = useState(true);

  useEffect(() => {
    const timerEnabled = localStorage.getItem('orderTimerEnabled') === 'true';
    if(timerEnabled) {
      const checkShopStatus = () => {
        const now = new Date();
        const currentHour = now.getHours();
        setShopOpen(currentHour >= 8 && currentHour < 14);
      };
      checkShopStatus();
      const interval = setInterval(checkShopStatus, 1000);
      return () => clearInterval(interval);
    } else {
      setShopOpen(true);
    }
  }, []);

  return (
    <div>
      <section>
        <h1 className="text-4xl font-headline font-bold mb-8 text-center">Place a New Order</h1>
        <OrderTimer />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {menuItems.map(item => (
            <MenuItemCard key={item.id} item={item} isShopOpen={shopOpen} />
          ))}
        </div>
      </section>
    </div>
  );
}
