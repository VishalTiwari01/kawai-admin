import { Pencil, Trash2, Eye, Package, ArrowRight, Layers, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface ProductListProps {
  products: any[];
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
  onView?: (id: string) => void;
}

const formatPrice = (value?: number | null) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value ?? 0);

export const ProductList = ({
  products,
  onEdit,
  onDelete,
  onView,
}: ProductListProps) => {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {products.map((product, index) => {
            const firstVariant = product.variants?.[0];
            const stock = product.variants?.reduce(
              (sum: number, v: any) => sum + (v.stockQuantity ?? 0),
              0
            );

            const imageSrc =
              product.images?.[0]?.imageUrl ||
              firstVariant?.images?.[0]?.imageUrl ||
              "https://via.placeholder.com/100?text=No+Image";

            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group relative bg-card hover:bg-accent/5 rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-primary/5 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row p-5 gap-6">
                  {/* Image Section */}
                  <div className="relative h-32 w-full md:w-32 flex-shrink-0">
                    <img
                      src={imageSrc}
                      alt={product.name}
                      className="h-full w-full rounded-xl object-cover border border-border/50 shadow-sm group-hover:scale-105 transition-transform duration-500"
                    />
                    {stock === 0 ? (
                      <Badge variant="destructive" className="absolute -top-2 -left-2 shadow-lg">
                        Out of Stock
                      </Badge>
                    ) : stock < 10 ? (
                      <Badge variant="warning" className="absolute -top-2 -left-2 bg-amber-500 text-white shadow-lg">
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge className="absolute -top-2 -left-2 bg-green-500 text-white shadow-lg">
                        In Stock
                      </Badge>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h3 className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
                            {product.name}
                          </h3>
                          <div className="flex flex-wrap gap-2 items-center">
                            <Badge variant="secondary" className="font-medium flex items-center gap-1 py-0.5">
                              <Tag size={10} />
                              {product.categoryName || 'Uncategorized'}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Layers size={12} />
                              {product.variants?.length ?? 0} variants
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-black text-primary">
                            {formatPrice(firstVariant?.salePrice ?? firstVariant?.price)}
                          </div>
                          {firstVariant?.salePrice && (
                            <div className="text-sm line-through text-muted-foreground font-medium">
                              {formatPrice(firstVariant.price)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-1 italic">
                        {product.shortDescription || product.description || "No description provided."}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="flex -space-x-2">
                           {product.images?.slice(0, 3).map((img: any, i: number) => (
                             <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-muted overflow-hidden">
                               <img src={img.imageUrl} className="w-full h-full object-cover" />
                             </div>
                           ))}
                           {product.images?.length > 3 && (
                             <div className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold">
                               +{product.images.length - 3}
                             </div>
                           )}
                         </div>
                         <div className="h-4 w-px bg-border" />
                         <span className="text-xs font-semibold text-muted-foreground">
                           SKU: <span className="text-foreground uppercase">{firstVariant?.sku?.split('-')[0] || 'N/A'}</span>
                         </span>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="rounded-full hover:bg-primary hover:text-primary-foreground border-primary/20"
                              onClick={() => onView?.(product._id)}
                            >
                              <Eye size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Quick View</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="rounded-full hover:bg-blue-500 hover:text-white border-blue-500/20"
                              onClick={() => onEdit(product)}
                            >
                              <Pencil size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Details</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="rounded-full hover:bg-destructive hover:text-destructive-foreground border-destructive/20"
                              onClick={() => onDelete(product.shiprocketProductId)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete Product</TooltipContent>
                        </Tooltip>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-2 group/btn font-bold text-primary hover:text-primary hover:bg-primary/5 rounded-full"
                          onClick={() => onView?.(product._id)}
                        >
                          Details <ArrowRight size={14} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative background element */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {products.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/20 rounded-3xl border-2 border-dashed border-border"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Package size={40} className="text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No products found</h3>
            <p className="max-w-[300px] text-center mt-2">Try adjusting your search or add a new product to get started.</p>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
};
