import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Save, X, Eye, Palette } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface EditModeToolbarProps {
  onSave: () => void;
  onCancel: () => void;
  onPreview: () => void;
  onColorChange: (colors: { primary: string; secondary: string; accent: string }) => void;
  colors: { primary: string; secondary: string; accent: string };
}

export const EditModeToolbar = ({
  onSave,
  onCancel,
  onPreview,
  onColorChange,
  colors,
}: EditModeToolbarProps) => {
  const [tempColors, setTempColors] = useState(colors);

  const hslToHex = (hsl: string): string => {
    // Parse HSL string like "262.1 83.3% 57.8%"
    const parts = hsl.split(' ');
    if (parts.length !== 3) return '#6366f1';
    
    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1]) / 100;
    const l = parseFloat(parts[2]) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }

    const toHex = (n: number) => {
      const hex = Math.round((n + m) * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const hexToHsl = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
        case g: h = ((b - r) / d + 2) * 60; break;
        case b: h = ((r - g) / d + 4) * 60; break;
      }
    }

    return `${h.toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
  };

  const applyColors = () => {
    onColorChange(tempColors);
  };

  return (
    <Card className="fixed top-20 left-4 z-50 p-4 shadow-2xl border-2 border-primary/20 animate-fade-in">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 pb-2 border-b">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-bold text-sm">وضع التعديل نشط</span>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Palette className="w-4 h-4" />
              ألوان الموقع
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h3 className="font-bold text-sm mb-4">تخصيص الألوان الأساسية</h3>
              
              <div className="space-y-2">
                <Label htmlFor="primary-color">اللون الرئيسي</Label>
                <div className="flex gap-2">
                  <input
                    id="primary-color"
                    type="color"
                    value={hslToHex(tempColors.primary)}
                    onChange={(e) => setTempColors({ ...tempColors, primary: hexToHsl(e.target.value) })}
                    className="w-12 h-10 cursor-pointer rounded border"
                  />
                  <div className="flex-1 text-xs text-muted-foreground flex items-center">
                    {tempColors.primary}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary-color">اللون الثانوي</Label>
                <div className="flex gap-2">
                  <input
                    id="secondary-color"
                    type="color"
                    value={hslToHex(tempColors.secondary)}
                    onChange={(e) => setTempColors({ ...tempColors, secondary: hexToHsl(e.target.value) })}
                    className="w-12 h-10 cursor-pointer rounded border"
                  />
                  <div className="flex-1 text-xs text-muted-foreground flex items-center">
                    {tempColors.secondary}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accent-color">لون التمييز</Label>
                <div className="flex gap-2">
                  <input
                    id="accent-color"
                    type="color"
                    value={hslToHex(tempColors.accent)}
                    onChange={(e) => setTempColors({ ...tempColors, accent: hexToHsl(e.target.value) })}
                    className="w-12 h-10 cursor-pointer rounded border"
                  />
                  <div className="flex-1 text-xs text-muted-foreground flex items-center">
                    {tempColors.accent}
                  </div>
                </div>
              </div>

              <Button onClick={applyColors} className="w-full" size="sm">
                تطبيق الألوان
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button onClick={onPreview} variant="outline" size="sm" className="gap-2">
          <Eye className="w-4 h-4" />
          معاينة
        </Button>

        <Button onClick={onSave} size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
          <Save className="w-4 h-4" />
          حفظ التغييرات
        </Button>

        <Button onClick={onCancel} variant="destructive" size="sm" className="gap-2">
          <X className="w-4 h-4" />
          إلغاء
        </Button>

        <div className="pt-2 border-t text-xs text-muted-foreground text-center">
          اضغط على أي نص لتعديله
        </div>
      </div>
    </Card>
  );
};
