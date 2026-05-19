import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, aspectRatio = '16:9', creativity = 0.7 } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // server: starting preview generation

    // 1. Combine enhancing and fast preview
    let enhancedPrompt = prompt;
    try {
      const groqUrl = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
      const groqRes = await fetch(groqUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
          temperature: typeof creativity === 'number' ? creativity : 0.7,
          max_tokens: 75,
          messages: [
            { 
              role: "system", 
              content: "You are an expert AI image prompt engineer. Enhance the user's input into a highly descriptive, visually striking image generation prompt. Focus on lighting, atmosphere, and cinematic style. Keep it strictly under 50 words. CRITICAL: Output ONLY the optimized prompt text. No conversational text, no introductions, no quotes." 
            },
            { role: "user", content: prompt }
          ]
        })
      });

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        enhancedPrompt = groqData.choices?.[0]?.message?.content?.trim() || prompt;
      }
    } catch (e) {
      console.warn("⚠️ Groq error, using original prompt.", (e as Error)?.message || String(e));
    }

    // 2. Pollinations Turbo Preview
    const safePrompt = encodeURIComponent(enhancedPrompt);
    const randomSeed = Math.floor(Math.random() * 1000000); 

    let width = 768; // Reduced preview size for vastly faster DB loading
    let height = 432;
    if (aspectRatio === "9:16") {
      width = 432;
      height = 768;
    } else if (aspectRatio === "1:1") {
      width = 512;
      height = 512;
    }
    
    const baseUrl = process.env.POLLINATIONS_PREVIEW_API_URL || "https://image.pollinations.ai/prompt/";
    const aiUrl = `${baseUrl}${safePrompt}?width=${width}&height=${height}&nologo=true&seed=${randomSeed}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // STRICT 8-SECOND KILL SWITCH

    try {
      const response = await fetch(aiUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "ImagineApp/1.0",
          "Accept": "image/jpeg"
        }
      });
      clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type") || "";

      if (!response.ok || !contentType.includes("image/")) {
        throw new Error("Invalid response or API error");
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = `data:image/jpeg;base64,${buffer.toString("base64")}`;

      return NextResponse.json({ 
        success: true, 
        image_url: base64Image,
        enhanced_prompt: enhancedPrompt
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.warn("Preview generation error/timeout, using fallback:", fetchError);
      
      return NextResponse.json({ 
        success: false, 
        message: "The AI generation servers are currently cooling down. Please wait 10 seconds and try again." 
      }, { status: 200 });
    }
  } catch (error) {
    console.warn("Preview route top-level error:", error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
