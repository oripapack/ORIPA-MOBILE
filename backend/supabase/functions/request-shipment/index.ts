import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "npm:@supabase/supabase-js@2";
import { scheduleMint } from "../_shared/scheduleMint.ts";
import {
  errorResponse,
  jsonResponse,
  optionsResponse,
  parseUuid,
  requireBearer,
} from "../_shared/http.ts";

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
    phone?: string;
  };
};

type RpcRow = {
  status: string;
  pull_id?: string;
  fulfillment_status?: string;
  mint_status?: string;
  shipping_order_id?: string;
  error_code?: string;
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
  if (raw.includes("PULL_NOT_FOUND") || raw.includes("VAULT_ITEM_NOT_FOUND")) {
    return { status: 404, code: "PULL_NOT_FOUND", message: raw };
  }
  if (raw.includes("NOT_ELIGIBLE_FOR_SHIPMENT") || raw.includes("VAULT_ITEM_NOT_SHIPPABLE")) {
    return { status: 400, code: "NOT_ELIGIBLE_FOR_SHIPMENT", message: raw };
  }
  if (raw.includes("INVALID_SHIPPING_ADDRESS") || raw.includes("ADDRESS_")) {
    return { status: 400, code: "INVALID_SHIPPING_ADDRESS", message: raw };
  }
  if (raw.includes("INSUFFICIENT_CREDITS") || raw.includes("INSUFFICIENT_FUNDS")) {
    return { status: 402, code: "INSUFFICIENT_FUNDS", message: raw };
  }
  if (
    raw.includes("DUPLICATE_TRANSACTION") ||
    raw.includes("INVALID_FULFILLMENT_STATUS") ||
    raw.includes("ALREADY_")
  ) {
    return { status: 409, code: "DUPLICATE_TRANSACTION", message: raw };
  }
  return {
    status: 500,
    code: "SHIPMENT_REQUEST_FAILED",
    message: raw || "Unknown error",
  };
}

function isValidAddress(address: RequestShipmentBody["shipping_address"]): boolean {
  if (!address || typeof address !== "object") return false;
  return Boolean(
    String(address.fullName ?? "").trim() &&
      String(address.line1 ?? "").trim() &&
      String(address.city ?? "").trim() &&
      String(address.country ?? "").trim(),
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return optionsResponse();

  if (req.method !== "POST") {
    return errorResponse(405, "METHOD_NOT_ALLOWED", "Method not allowed");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    return errorResponse(
      500,
      "SERVER_MISCONFIGURED",
      "Server misconfigured (Supabase env)",
    );
  }

  if (!requireBearer(req)) {
    return errorResponse(401, "UNAUTHORIZED", "Bearer token required");
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
    return errorResponse(401, "UNAUTHORIZED", "Sign in required");
  }

  let body: RequestShipmentBody;
  try {
    body = (await req.json()) as RequestShipmentBody;
  } catch {
    return errorResponse(400, "INVALID_JSON", "Invalid JSON body");
  }

  const pullId = parseUuid(body.pull_id);
  if (!pullId) {
    return errorResponse(400, "INVALID_PULL_ID", "pull_id (UUID) is required");
  }

  const address = body.shipping_address;
  if (!isValidAddress(address)) {
    return errorResponse(
      400,
      "INVALID_SHIPPING_ADDRESS",
      "shipping_address requires fullName, line1, city, and country",
    );
  }

  const { data: rpcData, error: rpcErr } = await userClient.rpc(
    "request_physical_shipment",
    {
      p_pull_id: pullId,
      p_shipping_address: {
        fullName: String(address.fullName).trim(),
        line1: String(address.line1).trim(),
        line2: address.line2 ? String(address.line2).trim() : undefined,
        city: String(address.city).trim(),
        region: address.region ? String(address.region).trim() : undefined,
        postal: address.postal ? String(address.postal).trim() : undefined,
        country: String(address.country).trim(),
        phone: address.phone ? String(address.phone).trim() : undefined,
      },
    },
  );

  if (rpcErr) {
    const mapped = mapRpcError(rpcErr);
    return errorResponse(mapped.status, mapped.code, mapped.message);
  }

  const result = rpcData as RpcRow;
  if (!result?.pull_id && !result?.status) {
    return errorResponse(500, "SHIPMENT_REQUEST_FAILED", "Empty RPC response");
  }

  const mintStatus = result.mint_status ?? "";

  if (
    mintStatus === "mint_pending" &&
    (result.status === "ok" || result.status === "already_requested" ||
      result.status === "already_processed")
  ) {
    try {
      scheduleMint(pullId);
    } catch (e) {
      console.error("scheduleMint failed", e);
    }
  }

  return jsonResponse({
    pull_id: result.pull_id ?? pullId,
    status: result.status,
    fulfillment_status: result.fulfillment_status,
    mint_status: mintStatus,
    shipping_order_id: result.shipping_order_id,
    error_code: result.error_code,
  });
});
