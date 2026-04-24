import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import CategoryItem from "@/components/categories/CategoryItem";
import CategoryModal from "@/components/categories/CategoryModal";
import { Plus, FolderTree, Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/api/api";

interface Category {
  _id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  parentId?: string | null;
  children?: Category[];
}

export default function Categories() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState("");

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories-tree"],
    queryFn: getCategoryTree,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories-tree"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Category }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories-tree"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories-tree"] });
    },
  });

  const handleSave = (data: Category) => {
    const payload = {
      ...data,
      parentId: data.parentId || null
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }

    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this category?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredCategories = categories.filter((cat: any) => 
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-8 max-w-7xl mx-auto space-y-8"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <FolderTree className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Architecture</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Category Manager
          </h1>
          <p className="text-muted-foreground font-medium">
            Organize your products into a beautiful hierarchy.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingCategory(null);
            setModalOpen(true);
          }}
          className="rounded-2xl h-12 px-6 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold gap-2 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Create Category
        </Button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative group max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Filter categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 bg-background/60 backdrop-blur-sm border-border/50 rounded-2xl focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
        />
      </div>

      {/* CATEGORY TREE CONTAINER */}
      <div className="bg-background/40 backdrop-blur-md rounded-[2.5rem] border border-border/50 shadow-xl overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-lg shadow-primary/20" />
            <span className="text-sm font-bold text-primary animate-pulse uppercase tracking-widest">Loading Hierarchy</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
            <div className="p-6 rounded-full bg-muted/30 border border-border/50 text-muted-foreground">
              <Sparkles className="w-12 h-12 opacity-20" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">No Categories Found</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                {search ? "No matches for your search. Try a different keyword." : "Start building your store structure by creating your first category."}
              </p>
            </div>
            {!search && (
              <Button variant="outline" onClick={() => setModalOpen(true)} className="rounded-xl font-bold">
                Create First Category
              </Button>
            )}
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredCategories.map((category: Category, index: number) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CategoryItem
                    category={category}
                    level={0}
                    onEdit={(cat: Category) => {
                      setEditingCategory(cat);
                      setModalOpen(true);
                    }}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <CategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editingCategory={editingCategory}
      />
    </motion.div>
  );
}