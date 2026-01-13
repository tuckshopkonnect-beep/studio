
"use client";

import { menuItems } from '@/lib/data';
import MenuItemCard from '@/components/MenuItemCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Timer, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

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
const OrderTimer = () => {
    const [timerState, setTimerState] = useState({
        isEnabled: false,
        isOpen: false,
        countdown: '',
        openTimeStr: '8:00 AM',
        closeTimeStr: '2:00 PM',
    });

    useEffect(() => {
        const timerEnabled = localStorage.getItem('orderTimerEnabled') === 'true';

        if (!timerEnabled) {
            setTimerState(prev => ({ ...prev, isEnabled: false, isOpen: true }));
            return;
        }

        const openTimeValue = localStorage.getItem('orderOpenTime') || '08:00';
        const closeTimeValue = localStorage.getItem('orderCloseTime') || '14:00';
        
        const [openHour, openMinute] = openTimeValue.split(':').map(Number);
        const [closeHour, closeMinute] = closeTimeValue.split(':').map(Number);

        const formatTime = (h: number, m: number) => {
            const period = h >= 12 ? 'PM' : 'AM';
            const hour12 = h % 12 || 12;
            return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
        };

        const calculateTimer = () => {
            const now = new Date();
            
            const openTime = new Date();
            openTime.setHours(openHour, openMinute, 0, 0);
            
            const closeTime = new Date();
            closeTime.setHours(closeHour, closeMinute, 0, 0);

            let isOpen = now >= openTime && now < closeTime;
            let targetTime;
            let messagePrefix;

            if (now < openTime) {
                // Before opening
                targetTime = openTime;
                messagePrefix = 'Opens in:';
            } else if (now >= closeTime) {
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
                openTimeStr: formatTime(openHour, openMinute),
                closeTimeStr: formatTime(closeHour, closeMinute),
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
                Orders are accepted between {timerState.openTimeStr} and {timerState.closeTimeStr}. {timerState.countdown}
            </AlertDescription>
        </Alert>
    );
};
// --- End OrderTimer Component ---

export default function OrderPage() {
  const [shopOpen, setShopOpen] = useState(true);
  const [ordersStopped, setOrdersStopped] = useState(false);

  useEffect(() => {
    // Check for master override first
    const stopOrders = localStorage.getItem('stopOrders') === 'true';
    setOrdersStopped(stopOrders);
    
    if (stopOrders) {
      setShopOpen(false);
      return; // No need to check timer if orders are stopped globally
    }

    // If not globally stopped, check the timer
    const timerEnabled = localStorage.getItem('orderTimerEnabled') === 'true';
    if(timerEnabled) {
      const checkShopStatus = () => {
        const openTimeValue = localStorage.getItem('orderOpenTime') || '08:00';
        const closeTimeValue = localStorage.getItem('orderCloseTime') || '14:00';
        const [openHour, openMinute] = openTimeValue.split(':').map(Number);
        const [closeHour, closeMinute] = closeTimeValue.split(':').map(Number);

        const now = new Date();
        const openTime = new Date();
        openTime.setHours(openHour, openMinute, 0, 0);
        const closeTime = new Date();
        closeTime.setHours(closeHour, closeMinute, 0, 0);

        setShopOpen(now >= openTime && now < closeTime);
      };
      checkShopStatus();
      const interval = setInterval(checkShopStatus, 1000 * 60); // Check every minute
      return () => clearInterval(interval);
    } else {
      setShopOpen(true);
    }
  }, []);

  return (
    <div>
      <section>
        <h1 className="text-4xl font-headline font-bold mb-8 text-center">Place a New Order</h1>
        {ordersStopped ? <StopOrdersAlert /> : <OrderTimer />}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {menuItems.map(item => (
            <MenuItemCard key={item.id} item={item} isShopOpen={shopOpen} />
          ))}
        </div>
      </section>
    </div>
  );
}
