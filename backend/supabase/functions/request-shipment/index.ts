import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "npm:@supabase/supabase-js@2";
import { scheduleMint } from "../_shared/scheduleMint.ts";

type RequestShipmentBody = {
  pull_id: string;
  shipping_address: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    region?: string;
    postal?: string;
    country: string;
  };
};

type RpcRow = {
  status: string;
  pull_id?: string;
  fulfillment_status?: string;
  mint_status?: string;
};

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function mapRpcError(error: { message?: string; details?: string }): {
  status: number;
  code: string;
  message: string;
} {
  const raw = `${error.message ?? ""} ${error.details ?? ""}`;
  if (raw.includes("UNAUTHORIZED")) {
    return { status: 401, code: "UNAUTHORIZED", message: raw };
  }
  if (raw.includes("FORBIDDEN")) {
    return { status: 403, code: "FORBIDDEN", message: raw };
  }
  if (raw.includes("PULL_NOT_FOUND")) {
    return { status: 404, code: "PULL_NOT_FOUND", message: raw };
  }
  if (raw.includes("NOT_ELIGIBLE_FOR_SHIPMENT")) {
    return { status: 400, code: "NOT_ELIGIBLE_FOR_SHIPMENT", message: raw };
  }
  if (raw.includes("INVALID_SHIPPING_ADDRESS")) {
    return { status: 400, code: "INVALID_SHIPPING_ADDRESS", message: raw };
  }
  if (raw.includes("INVALID_FULFILLMENT_STATUS") || raw.includes("ALREADY_")) {
    return { status: 409, code: "CONFLICT", message: raw };
  }
  return { status: 500, code: "SHIPMENT_REQUEST_FAILED", message: raw || "Unknown error" };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(
      JSON.stringify({ error: "Server misconfigured (Supabase env)" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();

  if (userErr || !user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: RequestShipmentBody;
  try {
    body = (await req.json()) as RequestShipmentBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const pullId = parseUuid(body.pull_id);
  if (!pullId) {
    return new Response(
      JSON.stringify({ error: "pull_id (UUID) is required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const address = body.shipping_address;
  if (!address || typeof address !== "object") {
    return new Response(
      JSON.stringify({ error: "shipping_address is required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const { data: rpcData, error: rpcErr } = await userClient.rpc(
    "request_physical_shipment",
    {
      p_pull_id: pullId,
      p_shipping_address: address,
    },
  );

  if (rpcErr) {
    const mapped = mapRpcError(rpcErr);
    return new Response(
      JSON.stringify({ error: mapped.code, message: mapped.message }),
      {
        status: mapped.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const result = rpcData as RpcRow;
  const mintStatus = result.mint_status ?? "";

  if (
    mintStatus === "mint_pending" &&
    (result.status === "ok" || result.status === "already_requested")
  ) {
    scheduleMint(pullId);
  }

  return new Response(
    JSON.stringify({
      pull_id: result.pull_id ?? pullId,
      status: result.status,
      fulfillment_status: result.fulfillment_status,
      mint_status: mintStatus,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});

function parseUuid(value: string | null | undefined): string | null {
  if (value == null || value === "") return null;
  const s = String(value).trim();
  const re =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return re.test(s) ? s : null;
}
