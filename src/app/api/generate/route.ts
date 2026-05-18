import { NextResponse } from "next/server";

// 🚨 THIS IS THE MAGIC FIX: Tells Vercel to give us up to 60 seconds instead of 15!
export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body.prompt;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Server-side log: starting generation

    // 0. The Brain: Enhance prompt with Groq (Fallback to original if it fails)
    let enhancedPrompt = prompt;
    try {
      const groqUrl = "https://api.groq.com/openai/v1/chat/completions";
      const groqRes = await fetch(groqUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { 
              role: "system", 
              content: "You are an expert AI image prompt engineer. Rewrite the following simple idea into a highly detailed, cinematic, photorealistic prompt (under 60 words). Return ONLY the exact prompt text, no intro, no quotes." 
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

    // 1. Prepare the exact turbo prompt
    const safePrompt = encodeURIComponent(enhancedPrompt);
    const randomSeed = Math.floor(Math.random() * 1000000); 
    
    // We explicitly call model=turbo and add a seed so it doesn't give us old cached images
    const aiUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=1024&height=1024&model=turbo&nologo=true&seed=${randomSeed}`;

    // 2. Fetch from Pollinations (No more impatient 8-second abort timer!)
    const response = await fetch(aiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "image/jpeg"
      }
    });

    if (!response.ok) {
      throw new Error(`AI API failed with status: ${response.status}`);
    }

    // 3. Convert to Base64 to bypass Next.js image blocks
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = `data:image/jpeg;base64,${buffer.toString("base64")}`;

    // successful generation

    return NextResponse.json({ 
      success: true, 
      image_url: base64Image,
      enhanced_prompt: enhancedPrompt
    });

  } catch (error) {
    // log the error server-side (no stack traces returned to client)
    console.warn("Generation error:", (error as Error)?.message || String(error));
    
    // 4. THE FALLBACK (Only triggers if Pollinations is completely broken)
    try {
      const fallbackResponse = await fetch("https://picsum.photos/1024/1024");
      const fallbackBuffer = await fallbackResponse.arrayBuffer();
      const fallbackBase64 = `data:image/jpeg;base64,${Buffer.from(fallbackBuffer).toString("base64")}`;
      
      return NextResponse.json({ 
        success: true, 
        image_url: fallbackBase64,
        warning: "AI was busy. Showing placeholder."
      });
    } catch (fallbackError) {
      // If fallback also fails, return soft failure to frontend for graceful degradation
      return NextResponse.json({ success: false }, { status: 200 });
    }
  }
}
