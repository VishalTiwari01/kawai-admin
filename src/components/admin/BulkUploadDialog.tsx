import { useState, useRef } from "react";
import { 
  FileUp, 
  Download, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileSpreadsheet,
  Trash2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { downloadSampleExcel } from "@/lib/excel-utils";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BulkUploadDialogProps {
  onUpload: (file: File) => Promise<any>;
}

export function BulkUploadDialog({ onUpload }: BulkUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const resetState = () => {
    setFile(null);
    setIsUploading(false);
    setUploadResult(null);
  };

  const handleSubmit = async () => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      const result = await onUpload(file);
      setUploadResult(result);
    } catch (error) {
      setUploadResult({ error: "Failed to upload file" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetState();
    }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-background hover:bg-muted border-dashed border-2 flex items-center gap-2 group transition-all duration-300 shadow-sm"
        >
          <FileUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Bulk Upload</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] overflow-hidden p-0 rounded-2xl border-none shadow-2xl">
        {/* Header with Gradient Background */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
              </div>
              Bulk Creation
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Upload your product catalog in bulk using our Excel template.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {!uploadResult ? (
            <>
              {/* Dropzone or Selected File */}
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div
                    key="dropzone"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      "relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-4 transition-all duration-300",
                      dragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/20 hover:border-primary/50"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                    />
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                      <FileUp className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground">Excel files only (.xlsx, .xls)</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="selected-file"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border rounded-xl p-4 flex items-center justify-between bg-muted/30 border-primary/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-medium text-sm truncate max-w-[250px]">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      disabled={isUploading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Processing file...</span>
                    <span>Uploading</span>
                  </div>
                  <Progress value={80} className="h-1.5 animate-pulse" />
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-dashed hover:bg-muted"
                  onClick={downloadSampleExcel}
                  disabled={isUploading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Sample
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg transition-all duration-300"
                  disabled={!file || isUploading}
                  onClick={handleSubmit}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Process Upload"
                  )}
                </Button>
              </div>
            </>
          ) : (
            /* Result Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className={cn(
                "w-20 h-20 rounded-full mx-auto flex items-center justify-center",
                uploadResult.success > 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
              )}>
                {uploadResult.success > 0 ? (
                  <CheckCircle2 className="w-10 h-10" />
                ) : (
                  <AlertCircle className="w-10 h-10" />
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold">
                  {uploadResult.success > 0 ? "Upload Successful!" : "Upload Failed"}
                </h3>
                <p className="text-muted-foreground">
                  {uploadResult.success} products were successfully created.
                  {uploadResult.failed > 0 && ` ${uploadResult.failed} products encountered errors.`}
                </p>
              </div>

              {uploadResult.errors?.length > 0 && (
                <div className="text-left bg-destructive/5 rounded-lg p-4 max-h-[150px] overflow-y-auto border border-destructive/10">
                  <p className="text-xs font-bold text-destructive mb-2">Error Logs:</p>
                  {uploadResult.errors.map((err: any, idx: number) => (
                    <div key={idx} className="text-xs text-destructive/80 py-1 border-b border-destructive/5 last:border-0">
                      • {err.productName || "Row"}: {err.error}
                    </div>
                  ))}
                </div>
              )}

              <Button className="w-full" onClick={() => setIsOpen(false)}>
                Done
              </Button>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
