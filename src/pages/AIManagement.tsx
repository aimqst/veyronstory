import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface AIConfig {
  id: string;
  name: string;
  age: number;
  personality: string;
  additional_info: string;
}

interface CustomData {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  display_order: number;
}

export default function AIManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [customData, setCustomData] = useState<CustomData[]>([]);
  const [editingData, setEditingData] = useState<string | null>(null);
  const [newData, setNewData] = useState({ title: "", content: "" });
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load AI config
      const { data: configData, error: configError } = await supabase
        .from("ai_config")
        .select("*")
        .single();

      if (configError) throw configError;
      setAiConfig(configData);

      // Load custom data
      const { data: customDataList, error: customError } = await supabase
        .from("ai_custom_data")
        .select("*")
        .order("display_order", { ascending: true });

      if (customError) throw customError;
      setCustomData(customDataList || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "خطأ",
        description: "فشل تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAIConfig = async () => {
    if (!aiConfig) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("ai_config")
        .update({
          name: aiConfig.name,
          age: aiConfig.age,
          personality: aiConfig.personality,
          additional_info: aiConfig.additional_info,
        })
        .eq("id", aiConfig.id);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم تحديث شخصية الـ AI بنجاح",
      });
    } catch (error) {
      console.error("Error updating AI config:", error);
      toast({
        title: "خطأ",
        description: "فشل تحديث البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCustomData = async () => {
    if (!newData.title || !newData.content) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("ai_custom_data").insert({
        title: newData.title,
        content: newData.content,
        display_order: customData.length,
      });

      if (error) throw error;

      toast({
        title: "تمت الإضافة",
        description: "تم إضافة البيانات بنجاح",
      });

      setNewData({ title: "", content: "" });
      setShowNewForm(false);
      loadData();
    } catch (error) {
      console.error("Error adding custom data:", error);
      toast({
        title: "خطأ",
        description: "فشل إضافة البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCustomData = async (id: string, updates: Partial<CustomData>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("ai_custom_data")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث البيانات بنجاح",
      });

      loadData();
    } catch (error) {
      console.error("Error updating custom data:", error);
      toast({
        title: "خطأ",
        description: "فشل تحديث البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomData = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه البيانات؟")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("ai_custom_data")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف البيانات بنجاح",
      });

      loadData();
    } catch (error) {
      console.error("Error deleting custom data:", error);
      toast({
        title: "خطأ",
        description: "فشل حذف البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !aiConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">إدارة الذكاء الاصطناعي</h1>

      {/* AI Personality Section */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">شخصية الـ AI</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">الاسم</Label>
            <Input
              id="name"
              value={aiConfig?.name || ""}
              onChange={(e) =>
                setAiConfig(aiConfig ? { ...aiConfig, name: e.target.value } : null)
              }
            />
          </div>

          <div>
            <Label htmlFor="age">العمر</Label>
            <Input
              id="age"
              type="number"
              value={aiConfig?.age || ""}
              onChange={(e) =>
                setAiConfig(
                  aiConfig ? { ...aiConfig, age: parseInt(e.target.value) } : null
                )
              }
            />
          </div>

          <div>
            <Label htmlFor="personality">الشخصية</Label>
            <Textarea
              id="personality"
              value={aiConfig?.personality || ""}
              onChange={(e) =>
                setAiConfig(
                  aiConfig ? { ...aiConfig, personality: e.target.value } : null
                )
              }
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="additional_info">معلومات إضافية</Label>
            <Textarea
              id="additional_info"
              value={aiConfig?.additional_info || ""}
              onChange={(e) =>
                setAiConfig(
                  aiConfig ? { ...aiConfig, additional_info: e.target.value } : null
                )
              }
              rows={4}
            />
          </div>

          <Button onClick={updateAIConfig} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
            حفظ التغييرات
          </Button>
        </div>
      </Card>

      {/* Custom Data Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">بيانات مخصصة للـ AI</h2>
          <Button onClick={() => setShowNewForm(!showNewForm)} variant="outline">
            <Plus className="h-4 w-4 ml-2" />
            إضافة بيانات
          </Button>
        </div>

        {/* New Data Form */}
        {showNewForm && (
          <Card className="p-4 mb-4 bg-muted">
            <div className="space-y-3">
              <div>
                <Label htmlFor="new-title">العنوان</Label>
                <Input
                  id="new-title"
                  value={newData.title}
                  onChange={(e) =>
                    setNewData({ ...newData, title: e.target.value })
                  }
                  placeholder="مثال: ساعات العمل"
                />
              </div>
              <div>
                <Label htmlFor="new-content">المحتوى</Label>
                <Textarea
                  id="new-content"
                  value={newData.content}
                  onChange={(e) =>
                    setNewData({ ...newData, content: e.target.value })
                  }
                  placeholder="مثال: نعمل من الساعة 9 صباحاً حتى 10 مساءً"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addCustomData} disabled={loading}>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ
                </Button>
                <Button
                  onClick={() => {
                    setShowNewForm(false);
                    setNewData({ title: "", content: "" });
                  }}
                  variant="outline"
                >
                  <X className="h-4 w-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Custom Data List */}
        <div className="space-y-3">
          {customData.map((item) => (
            <Card key={item.id} className="p-4">
              {editingData === item.id ? (
                <div className="space-y-3">
                  <Input
                    value={item.title}
                    onChange={(e) => {
                      const updated = customData.map((d) =>
                        d.id === item.id ? { ...d, title: e.target.value } : d
                      );
                      setCustomData(updated);
                    }}
                  />
                  <Textarea
                    value={item.content}
                    onChange={(e) => {
                      const updated = customData.map((d) =>
                        d.id === item.id ? { ...d, content: e.target.value } : d
                      );
                      setCustomData(updated);
                    }}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        updateCustomData(item.id, {
                          title: item.title,
                          content: item.content,
                        });
                        setEditingData(null);
                      }}
                      size="sm"
                    >
                      <Save className="h-4 w-4 ml-2" />
                      حفظ
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingData(null);
                        loadData();
                      }}
                      variant="outline"
                      size="sm"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-muted-foreground mt-1">{item.content}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.is_active}
                        onCheckedChange={(checked) =>
                          updateCustomData(item.id, { is_active: checked })
                        }
                      />
                      <Button
                        onClick={() => setEditingData(item.id)}
                        variant="ghost"
                        size="icon"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => deleteCustomData(item.id)}
                        variant="ghost"
                        size="icon"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}

          {customData.length === 0 && !showNewForm && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد بيانات مخصصة. اضغط على "إضافة بيانات" لإضافة معلومات جديدة.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
