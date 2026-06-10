import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "npm:@supabase/supabase-js@2";
import {
  MAX_MINT_ATTEMPTS,
  processMintForPullId,
} from "../_shared/processMint.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function authorizeCron(req: Request): boolean {
  const secret = Deno.env.get("MINT_CRON_SECRET");
  if (!secret) return false;
  const auth = req.headers.get("Authorization");
  const bearer = auth?.startsWith("Bearer ")
    ? auth.slice("Bearer ".length)
    : undefined;
  const header = req.headers.get("x-cron-secret");
  return bearer === secret || header === secret;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!authorizeCron(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: pending, error } = await admin
    .from("pull_results")
    .select("id")
    .eq("mint_status", "mint_pending")
    .lt("mint_attempts", MAX_MINT_ATTEMPTS)
    .order("created_at", { ascending: true })
    .limit(25);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results: Array<{ id: string; outcome: string }> = [];
  for (const row of pending ?? []) {
    const r = await processMintForPullId(row.id, admin);
    results.push({
      id: row.id,
      outcome: r.status === "completed"
        ? "completed"
        : r.status === "skipped_no_wallet"
        ? "skipped_no_wallet"
        : r.status === "skipped_low_tier"
        ? "skipped_low_tier"
        : `pending:${(r as { error?: string }).error ?? "unknown"}`,
    });
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
