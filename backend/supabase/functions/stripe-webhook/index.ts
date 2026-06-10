import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17.7.0";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

type CreditTopUpResult = {
  status: string;
  balance?: number;
  idempotency_key?: string;
};

function parseCredits(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Math.trunc(raw);
  }
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw);
    if (Number.isFinite(n)) return Math.trunc(n);
  }
  return null;
}

function resolveUserId(session: Stripe.Checkout.Session): string | null {
  const ref = session.client_reference_id?.trim();
  if (ref && ref.length > 0) return ref;

  const meta = session.metadata ?? {};
  const fromMeta = (meta.user_id ?? meta.userId ?? meta.clerk_user_id)?.trim();
  if (fromMeta && fromMeta.length > 0) return fromMeta;

  return null;
}

function resolveCreditAmount(session: Stripe.Checkout.Session): number | null {
  const meta = session.metadata ?? {};
  const fromMeta = parseCredits(
    meta.credit_amount ?? meta.credits ?? meta.creditAmount,
  );
  if (fromMeta != null && fromMeta > 0) return fromMeta;

  if (session.amount_total != null && session.amount_total > 0) {
    const currency = (session.currency ?? "usd").toLowerCase();
    if (currency === "usd") {
      return Math.trunc(session.amount_total / 100);
    }
  }

  return null;
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

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeSecret || !webhookSecret || !supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing stripe-signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const body = await req.text();
  const cryptoProvider = Stripe.createSubtleCryptoProvider();
  const stripe = new Stripe(stripeSecret, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Stripe signature verification failed", msg);
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response(JSON.stringify({ received: true, ignored: event.type }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
    return new Response(
      JSON.stringify({ received: true, skipped: "payment_not_paid" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const userId = resolveUserId(session);
  const credits = resolveCreditAmount(session);

  if (!userId) {
    console.error("checkout.session.completed missing user id", session.id);
    return new Response(JSON.stringify({ error: "Missing user id" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (credits == null || credits <= 0) {
    console.error("checkout.session.completed missing credit amount", session.id);
    return new Response(JSON.stringify({ error: "Missing credit amount" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const idempotencyKey = `stripe_cs_${session.id}`;

  const { data, error } = await admin.rpc("credit_top_up_stripe", {
    p_user_id: userId,
    p_amount: credits,
    p_idempotency_key: idempotencyKey,
    p_description: `Stripe Checkout ${session.id}`,
  });

  if (error) {
    console.error("credit_top_up_stripe failed", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const result = data as CreditTopUpResult;

  return new Response(
    JSON.stringify({
      received: true,
      event_id: event.id,
      session_id: session.id,
      user_id: userId,
      credits,
      top_up: result,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
