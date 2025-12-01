import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette } from "lucide-react";

interface EditableTextProps {
  value: string;
  onChange: (value: string, color?: string) => void;
  multiline?: boolean;
  className?: string;
  color?: string;
  editMode: boolean;
  as?: "h1" | "h2" | "h3" | "p";
}

export const EditableText = ({
  value,
  onChange,
  multiline = false,
  className = "",
  color,
  editMode,
  as = "p",
}: EditableTextProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [textColor, setTextColor] = useState(color || "");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (color) setTextColor(color);
  }, [color]);

  const handleClick = () => {
    if (editMode) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    onChange(tempValue, textColor);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    } else if (e.key === "Enter" && !multiline && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <div className="relative">
        <div className="flex gap-2 items-start">
          {multiline ? (
            <Textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`${className} min-h-[100px]`}
              style={{ color: textColor }}
            />
          ) : (
            <Input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className={className}
              style={{ color: textColor }}
            />
          )}
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" type="button">
                <Palette className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">اختر لون النص</p>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-10 cursor-pointer rounded border"
                />
                <div className="flex gap-2 flex-wrap">
                  {["#000000", "#ffffff", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTextColor(preset)}
                      className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: preset }}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex gap-2 mt-2">
          <Button onClick={handleSave} size="sm">
            حفظ
          </Button>
          <Button onClick={handleCancel} variant="outline" size="sm">
            إلغاء
          </Button>
        </div>
      </div>
    );
  }

  const Component = as;
  const editableClass = editMode ? "cursor-pointer hover:bg-accent/50 hover:outline hover:outline-2 hover:outline-primary/50 transition-all rounded px-2 py-1" : "";

  return (
    <Component
      onClick={handleClick}
      className={`${className} ${editableClass}`}
      style={{ color: textColor }}
      title={editMode ? "اضغط للتعديل" : undefined}
    >
      {value}
    </Component>
  );
};
