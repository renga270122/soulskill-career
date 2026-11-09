import { generateResponse, GatewayError } from "@lovable.dev/ai-gateway";
export async function resumeJson(instructions: string, input: string): Promise<unknown> {
  try {
    const result = await generateResponse({ model: "openai/gpt-6-astra", instructions, input: `Return JSON only.\n${input}`, text: { format: { type: "json_object" } }, max_output_tokens: 10000 });
    const text = result.output.flatMap(item => item.type === "message" ? item.content.flatMap(c => c.type === "output_text" ? [c.text] : []) : []).join("");
    if (!text) throw new Error("No suggestion was returned. Your resume has not changed.");
    return JSON.parse(text);
  } catch (e) {
    if (e instanceof GatewayError) {
      console.error("Resume AI request failed", { code: e.code, ids: e.ids });
      throw new Error(e.httpStatus === 402 ? "AI credits are unavailable. Your resume is unchanged; continue editing manually." : "AI could not complete this request. Your resume is unchanged; you can continue manually.");
    }
    throw e;
  }
}