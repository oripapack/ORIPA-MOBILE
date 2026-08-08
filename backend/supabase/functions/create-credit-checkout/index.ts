import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17.7.0";
import {
  errorResponse,
  jsonResponse,
  optionsResponse,
  requireBearer,
} from "../_shared/http.ts";

type Body = {
  credits?: number;
  amount_cents?: number;
  bundle_id?: string;
  bundle_label?: string;
  success_url?: string;
  cancel_url?: string;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return optionsResponse();
  if (req.method !== "POST") {
    return errorResponse(405, "METHOD_NOT_ALLOWED", "Method not allowed");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  const defaultSuccess =
    Deno.env.get("STRIPE_CHECKOUT_SUCCESS_URL") ??
    "https://pullhub.com/credits/success";
  const defaultCancel =
    Deno.env.get("STRIPE_CHECKOUT_CANCEL_URL") ??
    "https://pullhub.com/credits/cancel";

  if (!supabaseUrl || !supabaseAnonKey || !stripeSecret) {
    return errorResponse(
      500,
      "SERVER_MISCONFIGURED",
      "Stripe or Supabase env missing",
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

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return errorResponse(400, "INVALID_JSON", "Invalid JSON body");
  }

  const credits = Math.trunc(Number(body.credits));
  const amountCents = Math.trunc(Number(body.amount_cents));
  if (!Number.isFinite(credits) || credits <= 0) {
    return errorResponse(400, "INVALID_CREDITS", "credits must be a positive integer");
  }
  if (!Number.isFinite(amountCents) || amountCents < 50) {
    return errorResponse(
      400,
      "INVALID_AMOUNT",
      "amount_cents must be at least 50 (Stripe minimum)",
    );
  }

  const successUrl = String(body.success_url ?? defaultSuccess).trim();
  const cancelUrl = String(body.cancel_url ?? defaultCancel).trim();
  if (!successUrl.startsWith("http") || !cancelUrl.startsWith("http")) {
    return errorResponse(400, "INVALID_URL", "success_url and cancel_url must be https URLs");
  }

  const stripe = new Stripe(stripeSecret, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  const label = String(body.bundle_label ?? body.bundle_id ?? "Credits").slice(0, 120);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: user.id,
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: `${credits.toLocaleString()} Pull Hub credits`,
              description: label,
            },
          },
        },
      ],
      metadata: {
        user_id: user.id,
        credit_amount: String(credits),
        bundle_id: String(body.bundle_id ?? ""),
      },
    });

    if (!session.url) {
      return errorResponse(500, "CHECKOUT_URL_MISSING", "Stripe did not return a checkout URL");
    }

    return jsonResponse({
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("create-credit-checkout failed", message);
    return errorResponse(500, "STRIPE_ERROR", message);
  }
});
