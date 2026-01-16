
'use client';
import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { startOfDay } from 'date-fns';
import type { Order } from '@/lib/data';

export function useTodaysSpending(userId: string | null | undefined) {
    const firestore = useFirestore();
    const [spentToday, setSpentToday] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const todaysOrdersQuery = useMemoFirebase(() => {
        if (!firestore || !userId) return null;
        const today = startOfDay(new Date());
        return query(
            collection(firestore, 'users', userId, 'orders'),
            where('orderDate', '>=', today.toISOString())
        );
    }, [firestore, userId]);

    const { data: todaysOrders, isLoading: isLoadingOrders, error } = useCollection<Order>(todaysOrdersQuery);

    useEffect(() => {
        if (userId === null || userId === undefined) {
            setSpentToday(0);
            setIsLoading(false);
            return;
        }

        if (isLoadingOrders) {
            setIsLoading(true);
            return;
        }
        
        if (todaysOrders) {
            const total = todaysOrders.reduce((sum, order) => sum + order.total, 0);
            setSpentToday(total);
        } else {
            setSpentToday(0);
        }
        setIsLoading(false);
    }, [todaysOrders, isLoadingOrders, userId]);

    return { spentToday, isLoadingSpending: isLoading };
}
