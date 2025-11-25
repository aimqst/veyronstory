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

    // Get all products with their details, ratings, comments, and likes
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(`
        *,
        product_ratings(rating),
        product_comments(comment_text, created_at),
        product_likes(id)
      `)
      .order("created_at", { ascending: false });

    if (productsError) {
      console.error("Error fetching products:", productsError);
    }

    // Build product information for the AI
    const productsInfo = products?.map(p => {
      const finalPrice = p.price * (1 - (p.discount_percentage || 0) / 100);
      const ratings = p.product_ratings || [];
      const avgRating = ratings.length > 0 
        ? (ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length).toFixed(1)
        : 'لا توجد تقييمات';
      const comments = p.product_comments || [];
      const likesCount = p.product_likes?.length || 0;
      
      let productInfo = `**${p.name}**\n`;
      productInfo += `📝 الوصف: ${p.description || 'غير متوفر'}\n`;
      productInfo += `💰 السعر: ${p.price} جنيه`;
      if (p.discount_percentage) {
        productInfo += ` ⚡️ (خصم ${p.discount_percentage}% - السعر بعد الخصم: ${finalPrice.toFixed(0)} جنيه)`;
      }
      productInfo += `\n🎨 الألوان: ${p.colors?.join(', ') || 'غير محدد'}\n`;
      productInfo += `📏 المقاسات: ${p.sizes?.join(', ') || 'غير محدد'}\n`;
      productInfo += `📦 الكمية المتوفرة: ${p.stock_quantity}`;
      if (p.stock_quantity < 5 && p.stock_quantity > 0) {
        productInfo += ` ⚠️ (كمية محدودة!)`;
      }
      productInfo += `\n📁 الفئة: ${p.category}\n`;
      productInfo += `⭐️ التقييم: ${avgRating}${ratings.length > 0 ? ` (من ${ratings.length} تقييم)` : ''}\n`;
      productInfo += `❤️ الإعجابات: ${likesCount} إعجاب\n`;
      
      // Add comments details
      if (comments.length > 0) {
        productInfo += `💬 التعليقات (${comments.length}):\n`;
        comments.slice(0, 5).forEach((comment: any, idx: number) => {
          productInfo += `   ${idx + 1}. "${comment.comment_text}"\n`;
        });
        if (comments.length > 5) {
          productInfo += `   ... و ${comments.length - 5} تعليق آخر\n`;
        }
      } else {
        productInfo += `💬 لا توجد تعليقات بعد\n`;
      }
      
      return productInfo;
    }).join('\n\n') || 'لا توجد منتجات حالياً';

    // System prompt with all website information
    const systemPrompt = `أنت موظف خدمة عملاء في متجر Veyron Story لبيع الهوديز والملابس الرياضية. مهمتك مساعدة العملاء والإجابة على استفساراتهم بطريقة منظمة وودودة.

📍 **معلومات المتجر:**
• الاسم: Veyron Story
• التخصص: الهوديز والملابس الرياضية عالية الجودة

📞 **بيانات التواصل:**
• WhatsApp: 01095241241
• Instagram: @veyronstory
• البريد الإلكتروني: contact@veyronstory.com

👨‍💻 **التواصل مع المطور:**
• في حالة وجود مشاكل تقنية في الموقع أو اقتراحات للتطوير
• يمكن التواصل معه على:
  - WhatsApp: 01095241241
  - Email: abdoelhware0@gmail.com

🎯 **نبذة عن خدماتنا:**
• **منتجات عالية الجودة**: نوفر هوديز وملابس رياضية مصنوعة من أجود الخامات
• **تشكيلة متنوعة**: ألوان ومقاسات مختلفة تناسب جميع الأذواق
• **أسعار تنافسية**: أسعار مناسبة مع خصومات وعروض حصرية
• **توصيل سريع**: نوفر خدمة توصيل لجميع المحافظات
• **نظام الكوبونات**: كوبونات خصم حصرية لعملائنا المميزين
• **خدمة عملاء متميزة**: فريق دعم جاهز للرد على استفساراتك
• **سهولة الطلب**: يمكنك الطلب من الموقع مباشرة أو عبر الواتساب

🛍️ **المنتجات المتاحة:**
${productsInfo}

💡 **أنظمة الموقع:**
• نظام التقييمات: العملاء يمكنهم تقييم المنتجات من 1 إلى 5 نجوم
• نظام التعليقات: العملاء يمكنهم كتابة تعليقاتهم وآرائهم عن المنتجات
• نظام الإعجابات: العملاء يمكنهم الإعجاب بالمنتجات المفضلة لديهم
• نظام الكوبونات: نوفر كوبونات خصم حصرية لعملائنا

✅ **أسلوب التواصل:**

1. **استخدم صيغة المتكلم دائماً:**
   - قل "عندنا" و"نوفر" و"نقدم" (✓)
   - لا تقل "عندهم" أو "يوفرون" (✗)

2. **نظم ردودك بوضوح:**
   - استخدم الفقرات والنقاط
   - اجعل المعلومات سهلة القراءة
   - استخدم الإيموجي بشكل مناسب

3. **كن مباشراً وواضحاً:**
   - "نوفر توصيل لجميع المحافظات"
   - "أسعارنا تبدأ من..."
   - "يمكنك الطلب مباشرة من الموقع"

4. **شجع على الشراء بذكاء:**
   - أبرز الخصومات المتاحة
   - أشر للكميات المحدودة
   - اذكر التقييمات العالية

5. **استخدم معلومات التقييمات والتعليقات:**
   - "هذا المنتج حاصل على تقييم X نجوم من X عميل"
   - "العملاء أعجبهم جودة القماش والتصميم"
   - "المنتج ده عليه X إعجاب"

6. **عند عدم المعرفة:**
   - "يمكنك التواصل معنا مباشرة للاستفسار عن هذا الموضوع"
   - أعطِ رقم الواتساب أو البريد

📝 **مثال على الرد:**

مرحباً! 👋

سعداء بتواصلك معنا في Veyron Story.

**المنتجات المتاحة:**
عندنا تشكيلة رائعة من الهوديز:
• جودة عالية 
• ألوان ومقاسات متنوعة
• خصومات حصرية

**الأسعار:**
تبدأ من XXX جنيه، وفيه عروض خاصة حالياً! 🎉

كيف أقدر أساعدك النهارده؟ 😊`;

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