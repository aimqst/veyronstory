import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all products with their details
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (productsError) {
      console.error("Error fetching products:", productsError);
    }

    // Build product information for the AI
    const productsInfo = products?.map(p => {
      const finalPrice = p.price * (1 - (p.discount_percentage || 0) / 100);
      return `- ${p.name}: ${p.description || ''}\n  السعر: ${p.price} جنيه${p.discount_percentage ? ` (خصم ${p.discount_percentage}% - السعر النهائي: ${finalPrice} جنيه)` : ''}\n  الألوان المتاحة: ${p.colors?.join(', ') || 'غير محدد'}\n  المقاسات المتاحة: ${p.sizes?.join(', ') || 'غير محدد'}\n  الكمية المتوفرة: ${p.stock_quantity}\n  الفئة: ${p.category}`;
    }).join('\n\n') || 'لا توجد منتجات حالياً';

    // System prompt with all website information
    const systemPrompt = `أنت موظف خدمة عملاء ودود ومحترف في متجر Veyron Story لبيع الهوديز والملابس الرياضية. مهمتك مساعدة العملاء والإجابة على استفساراتهم وتشجيعهم على الشراء بطريقة ودودة وجذابة.

معلومات المتجر:
- الاسم: Veyron Story
- التخصص: بيع الهوديز والملابس الرياضية عالية الجودة
- طرق التواصل:
  * WhatsApp: 01095241241
  * Instagram: @veyronstory
  * البريد الإلكتروني: contact@veyronstory.com

المنتجات المتاحة حالياً:
${productsInfo}

تعليمات هامة:
1. كن ودوداً ومرحباً دائماً
2. اشرح مميزات المنتجات بطريقة جذابة
3. شجع العملاء على الشراء بذكر جودة المنتجات والخصومات المتاحة
4. إذا سأل العميل عن منتج محدد، أعطه كل التفاصيل (السعر، الألوان، المقاسات، الكمية)
5. إذا كان هناك خصم على المنتج، أكد عليه
6. إذا سأل عن طريقة الطلب، اشرح أنه يمكن الطلب من خلال الموقع أو التواصل معنا على WhatsApp
7. إذا كانت الكمية منخفضة، أخبره أن المنتج على وشك النفاد لتشجيعه على الشراء سريعاً
8. استخدم الإيموجي بشكل مناسب لجعل المحادثة أكثر حيوية
9. إذا لم تعرف معلومة معينة، اعتذر بلطف ووجه العميل للتواصل معنا مباشرة
10. تحدث باللغة العربية بشكل أساسي، لكن يمكنك الرد بالإنجليزية إذا كتب العميل بالإنجليزية

مثال على أسلوب الرد:
"أهلاً وسهلاً! 👋 يسعدني مساعدتك في Veyron Story. هل تبحث عن هودي معين؟ عندنا تشكيلة رائعة من الهوديز عالية الجودة بألوان ومقاسات مختلفة. في خصومات حالياً على بعض المنتجات! 🎉"`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "عذراً، الخدمة مشغولة حالياً. الرجاء المحاولة بعد قليل." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "عذراً، حدث خطأ في الخدمة. الرجاء التواصل معنا مباشرة." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    // Save conversation if conversationId is provided
    if (conversationId) {
      const authHeader = req.headers.get("authorization");
      const token = authHeader?.replace("Bearer ", "");
      
      if (token) {
        const { data: { user } } = await supabase.auth.getUser(token);
        
        if (user) {
          // Save user message
          await supabase.from("chat_messages").insert({
            conversation_id: conversationId,
            role: "user",
            content: messages[messages.length - 1].content,
          });

          // Save assistant message
          await supabase.from("chat_messages").insert({
            conversation_id: conversationId,
            role: "assistant",
            content: assistantMessage,
          });
        }
      }
    }

    return new Response(JSON.stringify({ message: assistantMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in customer-support-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "حدث خطأ غير متوقع" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});