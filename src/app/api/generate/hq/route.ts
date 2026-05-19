import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { enhanced_prompt, aspectRatio = '16:9', aiModel = 'Pollinations AI' } = body;

    if (!enhanced_prompt) {
      return NextResponse.json({ error: "enhanced_prompt is required" }, { status: 400 });
    }

    // server: starting HQ generation

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

    if (useHuggingFace) {
      const hfUrl = process.env.HUGGINGFACE_API_URL || "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";
      res = await fetch(hfUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
          "Accept": "image/png",
        },
        body: JSON.stringify({
          inputs: enhanced_prompt,
          parameters: {
            width,
            height,
            num_inference_steps: 30,
            guidance_scale: 7.5,
          },
          options: {
            wait_for_model: true,
          },
        }),
      });
    } else {
      // Using Pollinations High-Quality Flux Realism model when Hugging Face is not selected/available.
      const seed = Math.floor(Math.random() * 100000);
      const baseUrl = process.env.POLLINATIONS_HQ_API_URL || "https://pollinations.ai/p/";
      const hqUrl = `${baseUrl}${encodeURIComponent(enhanced_prompt)}?width=${width}&height=${height}&model=flux-realism&nologo=true&seed=${seed}`;
      res = await fetch(hqUrl, {
        method: "GET",
      });
    }

    const contentType = res.headers.get("content-type") || "";

    // If the response is JSON (an error from the API)
    if (contentType.includes("application/json")) {
      const errorData = await res.json();
      console.warn("AI API returned JSON instead of image;", JSON.stringify(errorData));
      return NextResponse.json({ success: false, message: "Service busy. Use Preview." }, { status: 200 });
    }

    // If it's not an image, soft fail
    if (!contentType.includes("image/")) {
      return NextResponse.json({ success: false, message: "Service busy. Use Preview." }, { status: 200 });
    }

    if (!res.ok) {
      return NextResponse.json({ success: false, message: `HQ API failed with status: ${res.status}` }, { status: 200 });
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!buffer || buffer.length === 0) {
       throw new Error("buffer is empty");
    }

    const base64Image = `data:image/jpeg;base64,${buffer.toString("base64")}`;
    // HQ image generated

    return NextResponse.json({ 
      success: true, 
      image_url: base64Image 
    });

  } catch (error: any) {
    console.warn("HQ generation error:", (error as Error)?.message || String(error));
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
