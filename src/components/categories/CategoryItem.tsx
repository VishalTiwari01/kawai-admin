import { useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Trash2, Folder, FolderOpen, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CategoryItem({ category, level = 0, onEdit, onDelete }: any) {
  const [isOpen, setIsOpen] = useState(level < 1); // Auto-open root levels
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="space-y-2">
      {/* CATEGORY CARD */}
      <motion.div
        layout
        className={cn(
          "flex items-center justify-between group rounded-2xl border transition-all duration-300",
          level === 0 
            ? "bg-background/80 backdrop-blur-sm border-border/50 p-4 shadow-sm" 
            : "bg-muted/30 border-transparent hover:bg-muted/50 p-3"
        )}
        style={{ marginLeft: `${level * 32}px` }}
      >
        <div className="flex items-center gap-4 flex-1">
          <div 
            onClick={() => hasChildren && setIsOpen(!isOpen)}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
              hasChildren ? "cursor-pointer hover:bg-primary/10 text-primary" : "text-muted-foreground/30"
            )}
          >
            {hasChildren ? (
              isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
            )}
          </div>

          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted border border-border/50 shadow-inner group-hover:scale-105 transition-transform duration-500">
            {category.imageUrl ? (
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                <ImageIcon size={20} />
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {hasChildren ? (
                isOpen ? <FolderOpen size={14} className="text-primary" /> : <Folder size={14} className="text-primary" />
              ) : null}
              <span className={cn(
                "font-bold transition-colors",
                level === 0 ? "text-base" : "text-sm",
                isOpen && hasChildren ? "text-primary" : "text-foreground"
              )}>
                {category.name}
              </span>
            </div>
            {category.description && (
              <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                {category.description}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(category)}
            className="w-9 h-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(category._id)}
            className="w-9 h-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </motion.div>

      {/* CHILDREN */}
      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="overflow-hidden space-y-2"
          >
            {category.children.map((child: any) => (
              <CategoryItem
                key={child._id}
                category={child}
                level={level + 1}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}