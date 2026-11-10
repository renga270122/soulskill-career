import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { AI_MONTHLY_LIMIT } from "./pricing";
// Server-side entitlement + fair-use check; runs before every AI request.
export async function consumeAiAction(supabase: SupabaseClient<Database>) {
  const { error } = await supabase.rpc("consume_ai_action", { _limit: AI_MONTHLY_LIMIT });
  if (!error) return;
  if (error.message.includes("PREMIUM_REQUIRED")) throw new Error("AI tools are part of Career Support and Premium access. See Plans & billing to unlock them.");
  if (error.message.includes("AI_LIMIT_REACHED")) throw new Error(`You've used this month's ${AI_MONTHLY_LIMIT} AI actions. Your limit resets on the 1st; all other tools keep working.`);
  throw new Error("Your access could not be checked. Please try again.");
}
