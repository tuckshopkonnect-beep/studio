
"use client";

import { useState } from 'react';
import { initialInventory, InventoryItem } from '@/lib/data';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from 'lucide-react';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newStock, setNewStock] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setNewStock(item.stock.toString());
    setIsDialogOpen(true);
  };

  const handleSaveChanges = () => {
    if (selectedItem) {
        const stockValue = parseInt(newStock, 10);
        if (!isNaN(stockValue) && stockValue >= 0) {
            setInventory(currentInventory =>
                currentInventory.map(item =>
                    item.id === selectedItem.id ? { ...item, stock: stockValue } : item
                )
            );
            setIsDialogOpen(false);
        }
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>Track and manage stock levels for all menu items.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-center">Stock Level</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-center">{item.stock}</TableCell>
                  <TableCell className="text-center">
                    {item.stock === 0 ? (
                        <Badge variant="destructive">Out of Stock</Badge>
                    ) : item.stock <= item.lowStockThreshold ? (
                        <Badge className="bg-accent text-accent-foreground">Low Stock</Badge>
                    ) : (
                        <Badge className="border-transparent bg-chart-2/20 text-chart-2">In Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="icon" onClick={() => handleOpenDialog(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Stock: {selectedItem?.name}</DialogTitle>
            <DialogDescription>
              Update the current stock level for this item.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                New Stock
              </Label>
              <Input
                id="stock"
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveChanges}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
