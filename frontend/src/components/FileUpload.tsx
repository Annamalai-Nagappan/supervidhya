import { useCallback, useRef, useState } from "react";
import { Card, CardContent } from "@/components/card";
import { Button } from "@/components/Button";
import { Upload, FileText, X } from "lucide-react";

interface FileUploadProps {
  label: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

const FileUpload = ({ label, file, onFileChange }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped?.type === "application/pdf") onFileChange(dropped);
    },
    [onFileChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) onFileChange(selected);
  };

  return (
    <Card
      className={`transition-colors cursor-pointer ${isDragging ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !file && inputRef.current?.click()}
    >
      <CardContent className="p-6">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleChange}
        />
        <p className="text-sm font-medium text-muted-foreground mb-3">{label}</p>
        {file ? (
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary shrink-0" />
            <span className="text-sm truncate flex-1">{file.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={(e) => { e.stopPropagation(); onFileChange(null); }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
            <Upload className="h-8 w-8" />
            <span className="text-sm">Drag & drop or click to upload PDF</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;
