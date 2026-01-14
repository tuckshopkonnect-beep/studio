
"use client";

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import type { MenuItem as MenuItemType } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { File, PlusCircle, MoreHorizontal, Download, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, deleteDoc, setDoc } from "firebase/firestore";
import MenuItemDetailDialog from "@/components/MenuItemDetailDialog";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { InventoryItem } from "@/lib/data";


export default function InventoryPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const menuItemsCollection = useMemoFirebase(() => {
    if (!firestore || isUserLoading || !user) return null;
    return collection(firestore, "menuItems");
  }, [firestore, isUserLoading, user]);

  const { data: menu, isLoading: isLoadingMenu } = useCollection<MenuItemType>(menuItemsCollection);
  
  const [inventory, setInventoryState] = React.useState<InventoryItem[]>([]);
  
  React.useEffect(() => {
    if (menu) {
      setInventoryState(menu.map(item => ({
        id: (item as any).id,
        name: (item as any).name,
        stock: (item as any).stock ?? 100,
        lowStockThreshold: 15,
      })));
    }
  }, [menu]);

  const [itemToDelete, setItemToDelete] = React.useState<MenuItemType | null>(null);
  const [selectedItem, setSelectedItem] = React.useState<MenuItemType | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);


  const handleExportPDF = async () => {
    if (!menu) return;
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const { exportInventoryPDF } = await import('@/lib/pdf-utils');
    exportInventoryPDF(menu, inventory, jsPDF, autoTable);
  };

  const handleExportCSV = async () => {
    if (!menu) return;
    const { exportInventoryCSV } = await import('@/lib/csv-utils');
    exportInventoryCSV(menu, inventory);
  };
  
  const handleDeleteItem = async () => {
    if (!itemToDelete || !firestore) return;

    const docRef = doc(firestore, "menuItems", (itemToDelete as any).id.toString());
    deleteDocumentNonBlocking(docRef);

    toast({
      title: "Menu Item Deleted",
      description: `${(itemToDelete as any).name} has been removed from the menu.`,
    });
    setItemToDelete(null);
  };

  const handleOpenDialog = (item: MenuItemType | null, mode: 'create' | 'edit') => {
    setIsCreating(mode === 'create');
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDetailOpen(false);
    setSelectedItem(null);
    setIsCreating(false);
  }

  const handleSaveItem = async (itemData: MenuItemType) => {
    if (isUserLoading || !user) {
      toast({
        variant: "destructive",
        title: "Authentication in progress",
        description: "Please wait a moment before saving.",
      });
      return false;
    }

    if (!firestore) return false;
    
    const docRef = doc(firestore, "menuItems", String(itemData.id));
    setDocumentNonBlocking(docRef, itemData, { merge: true });

    toast({
      title: isCreating ? "Item Added" : "Item Updated",
      description: `${(itemData as any).name} has been saved successfully.`
    });
    handleCloseDialog();
    return true; 
  };
  
  if (isUserLoading || isLoadingMenu) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <>
    <ConfirmationDialog
        open={!!itemToDelete}
        onOpenChange={(isOpen) => !isOpen && setItemToDelete(null)}
        onConfirm={handleDeleteItem}
        title={`Delete "${(itemToDelete as any)?.name}"?`}
        description="This action cannot be undone. This will permanently delete the menu item and its inventory record."
        confirmButtonText="Yes, Delete Item"
    />

    <MenuItemDetailDialog
      isOpen={isDetailOpen}
      onOpenChange={handleCloseDialog}
      onSave={handleSaveItem}
      item={selectedItem}
      isCreating={isCreating}
      menuItems={menu || []}
      isSaving={isUserLoading}
    />

    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">In Stock</TabsTrigger>
          <TabsTrigger value="low">Low Stock</TabsTrigger>
          <TabsTrigger value="draft">Out of Stock</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" disabled={isUserLoading}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportPDF} disabled={!menu || menu.length === 0}>Export to PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV} disabled={!menu || menu.length === 0}>Export to CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" onClick={() => handleOpenDialog(null, 'create')} disabled={isUserLoading}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>
      <TabsContent value="all">
        <Card>
          <CardHeader>
            <CardTitle>Menu Items</CardTitle>
            <CardDescription>
              Manage your menu items and view their inventory status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Image</span>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Price</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Stock
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingMenu ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                      <p className="mt-2 text-muted-foreground">Loading menu...</p>
                    </TableCell>
                  </TableRow>
                ) : menu && menu.map((item) => {
                  const stockItem = inventory.find(inv => inv.id === (item as any).id);
                  const stock = stockItem?.stock ?? 0;
                  const stockStatus = stock === 0 ? "Out of Stock" : stock < (stockItem?.lowStockThreshold ?? 15) ? "Low Stock" : "In Stock";
                  
                  return (
                    <TableRow key={(item as any).id}>
                      <TableCell className="hidden sm:table-cell">
                        <Image
                          alt={(item as any).name}
                          className="aspect-square rounded-md object-cover"
                          height="64"
                          src={(item as any).image.imageUrl}
                          width="64"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{(item as any).name}</TableCell>
                      <TableCell>
                        <Badge variant={stockStatus === "Out of Stock" ? "destructive" : stockStatus === "Low Stock" ? "secondary" : "outline"}>
                          {stockStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        ₦{(item as any).price.toFixed(2)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{stock}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => handleOpenDialog(item, 'edit')}>Edit</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={() => setItemToDelete(item)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
    </>
  );
}
