// src/Admin.tsx

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProductList } from "@/components/admin/ProductList";
import { ProductForm } from "@/components/admin/ProductForm";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  fetchProducts,
  bulkUploadProducts,
  getCategories,
  getCategoryTree,
} from "@/api/api";

const Admin = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL params or defaults
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [categories, setCategories] = useState<any[]>([]);
  
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = useState(Number(searchParams.get("limit")) || 10);
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [isFeatured, setIsFeatured] = useState(searchParams.get("featured") || "all");
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 500);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
        
        // If the URL has a category name or old ID, try to resolve it
        const currentCat = searchParams.get("category");
        if (currentCat && currentCat !== "all" && cats.length > 0) {
          const found = cats.find(c => c.name === currentCat || c.title === currentCat || c._id === currentCat);
          if (found) {
            setCategory(found._id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCats();
  }, []);

  // Sync URL params when filters change
  useEffect(() => {
    const params: any = { page: String(page), limit: String(limit) };
    if (debouncedSearch) params.q = debouncedSearch;
    if (category !== "all") params.category = category;
    if (status !== "all") params.status = status;
    if (isFeatured !== "all") params.featured = isFeatured;
    
    setSearchParams(params, { replace: true });
  }, [page, limit, debouncedSearch, category, status, isFeatured, setSearchParams]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const result = await fetchProducts(
          debouncedSearch,
          page,
          limit,
          category === "all" ? undefined : category,
          status === "all" ? undefined : status,
          isFeatured === "all" ? undefined : isFeatured === "true"
        );
        setProducts(result.products);
        setTotalProducts(result.total);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, [debouncedSearch, page, limit, category, status, isFeatured]);

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      setLoading(true);
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => String(p.shiprocketProductId) !== String(id)));
      setTotalProducts((prev) => prev - 1);
      toast({
        title: "Product Deleted",
        description: "Product removed successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (file: File) => {
    const result = await bulkUploadProducts(file);
    // Refresh products if some succeeded
    if (result.success > 0) {
      const fetchResult = await fetchProducts(debouncedSearch, page, limit, category === "all" ? undefined : category, status === "all" ? undefined : status, isFeatured === "all" ? undefined : isFeatured === "true");
      setProducts(fetchResult.products);
      setTotalProducts(fetchResult.total);
    }
    return result;
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(undefined);
  };

  const handleOnView = (id: string) => {
    navigate(`/admin/products/${id}`);
  };

  const totalPages = Math.ceil(totalProducts / limit);

  // Google-style pagination range calculation
  const getPageRange = () => {
    const delta = 2;
    const range = [];
    const left = page - delta;
    const right = page + delta + 1;
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        range.push(i);
      }
    }

    const rangeWithDots = [];
    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-muted/20 pb-20"
    >
      <AdminHeader 
        onAddProduct={handleAddProduct} 
        onBulkUpload={handleBulkUpload}
      />

      <main className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row gap-4 mb-8 items-center justify-between bg-background/60 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm"
        >
          <div className="relative w-full lg:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 h-10 bg-background border-border/50 rounded-xl focus:ring-primary focus:border-primary transition-all shadow-none group-hover:border-primary/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Category Filter */}
            <Select value={category} onValueChange={(val) => { setCategory(val); setPage(1); }}>
              <SelectTrigger className="w-[140px] h-10 bg-background border-border/50 rounded-xl text-xs font-bold shadow-none">
                <Filter className="w-3 h-3 mr-2 opacity-50" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 shadow-xl">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>{cat.name || cat.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
              <SelectTrigger className="w-[130px] h-10 bg-background border-border/50 rounded-xl text-xs font-bold shadow-none">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 shadow-xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* Featured Filter */}
            <Select value={isFeatured} onValueChange={(val) => { setIsFeatured(val); setPage(1); }}>
              <SelectTrigger className="w-[130px] h-10 bg-background border-border/50 rounded-xl text-xs font-bold shadow-none">
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 shadow-xl">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="true">Featured</SelectItem>
                <SelectItem value="false">Standard</SelectItem>
              </SelectContent>
            </Select>

            <div className="w-px h-6 bg-border mx-1 hidden lg:block" />

            {/* Limit Selector */}
            <Select value={String(limit)} onValueChange={(val) => { setLimit(Number(val)); setPage(1); }}>
              <SelectTrigger className="w-[100px] h-10 bg-background border-border/50 rounded-xl text-xs font-bold shadow-none">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 shadow-xl">
                <SelectItem value="5">5 / page</SelectItem>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        <div className="relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-[2px] rounded-2xl transition-all duration-300">
               <div className="flex flex-col items-center gap-3">
                 <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg shadow-primary/20" />
                 <span className="text-sm font-bold text-primary animate-pulse">Syncing catalog...</span>
               </div>
            </div>
          )}

          <ProductList
            products={products}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onView={handleOnView}
          />
        </div>

        {/* ---------------- GOOGLE-STYLE PAGINATION ---------------- */}
        {totalPages > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex flex-col items-center gap-6 bg-background/60 backdrop-blur-sm p-6 rounded-2xl border border-border/50 shadow-sm"
          >
            <div className="flex items-center gap-1 overflow-x-auto max-w-full py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="h-10 rounded-xl px-4 hover:bg-primary/10 hover:text-primary transition-all font-bold group"
              >
                <ChevronLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Previous
              </Button>

              <div className="flex items-center gap-1 mx-4">
                {getPageRange().map((p, idx) => (
                  <button
                    key={idx}
                    disabled={typeof p !== "number" || loading}
                    onClick={() => typeof p === "number" && setPage(p)}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300",
                      p === page 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110" 
                        : typeof p === "number" 
                          ? "hover:bg-primary/10 hover:text-primary text-muted-foreground" 
                          : "text-muted-foreground cursor-default"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="h-10 rounded-xl px-4 hover:bg-primary/10 hover:text-primary transition-all font-bold group"
              >
                Next
                <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              Total <span className="text-foreground">{totalProducts}</span> products found 
              <span className="mx-3 opacity-30">|</span>
              Page <span className="text-primary">{page}</span> of <span className="text-foreground">{totalPages}</span>
            </div>
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {showForm && (
          <ProductForm
            product={editingProduct}
            onCancel={handleCancelForm}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Admin;