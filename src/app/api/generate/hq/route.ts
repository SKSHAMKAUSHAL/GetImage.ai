import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { enhanced_prompt, aspectRatio = '16:9', aiModel = 'Pollinations AI' } = body;

    if (!enhanced_prompt) {
      return NextResponse.json({ error: "enhanced_prompt is required" }, { status: 400 });
    }

    let width = 1920;
    let height = 1080;
    if (aspectRatio === "9:16") {
      width = 1080;
      height = 1920;
    } else if (aspectRatio === "1:1") {
      width = 1080;
      height = 1080;
    }

    const useHuggingFace = aiModel === 'Hugging Face SDXL' && Boolean(process.env.HUGGINGFACE_API_KEY);
    let res: Response;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      if (useHuggingFace) {
        const hfUrl = process.env.HUGGINGFACE_API_URL || "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5";
        res = await fetch(hfUrl, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
            "Accept": "image/png",
            "User-Agent": "ImagineApp/1.0"
          },
          body: JSON.stringify({
            inputs: enhanced_prompt,
            parameters: { width, height, num_inference_steps: 30, guidance_scale: 7.5 },
            options: { wait_for_model: true },
          }),
        });
      } else {
        const seed = Math.floor(Math.random() * 100000);
        const baseUrl = process.env.POLLINATIONS_HQ_API_URL || "https://pollinations.ai/p/";
        const hqUrl = `${baseUrl}${encodeURIComponent(enhanced_prompt)}?width=${width}&height=${height}&model=flux-realism&nologo=true&seed=${seed}`;
        res = await fetch(hqUrl, {
          method: "GET",
          signal: controller.signal,
          headers: { "User-Agent": "ImagineApp/1.0" }
        });
      }
      clearTimeout(timeoutId);

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json") || !contentType.includes("image/") || !res.ok) {
        return NextResponse.json({ success: false, message: "Hugging Face is busy." }, { status: 200 });
      }

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      if (!buffer || buffer.length === 0) throw new Error("buffer is empty");

      const base64Image = `data:image/jpeg;base64,${buffer.toString("base64")}`;
      return NextResponse.json({ success: true, image_url: base64Image });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.warn("HQ generation error/timeout:", fetchError);
      return NextResponse.json({ success: false, message: "Hugging Face is busy." }, { status: 200 });
    }
  } catch (error: any) {
    console.warn("HQ route error:", (error as Error)?.message || String(error));
    return NextResponse.json({ success: false, message: "Hugging Face is busy." }, { status: 200 });
  }
}
