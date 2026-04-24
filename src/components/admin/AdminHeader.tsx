import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BulkUploadDialog } from "./BulkUploadDialog";

interface AdminHeaderProps {
  onAddProduct: () => void;
  onBulkUpload: (file: File) => Promise<any>;
}

export const AdminHeader = ({ onAddProduct, onBulkUpload }: AdminHeaderProps) => {
  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-10 transition-all duration-300">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                <Package className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  Products
                </h1>
                <p className="text-xs text-muted-foreground font-medium">Manage your inventory catalog</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <BulkUploadDialog onUpload={onBulkUpload} />
            
            <Button
              onClick={onAddProduct}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 border-none transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};