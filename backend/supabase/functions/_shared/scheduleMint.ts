import { processMintForPullId } from "./processMint.ts";

/** Fire-and-forget mint worker (EdgeRuntime.waitUntil when available). */
export function scheduleMint(pullId: string) {
  const job = processMintForPullId(pullId).catch((err) =>
    console.error("mint background job failed", pullId, err)
  );
  const rt = (
    globalThis as unknown as {
      EdgeRuntime?: { waitUntil: (p: Promise<unknown>) => void };
    }
  ).EdgeRuntime;
  if (rt?.waitUntil) {
    rt.waitUntil(job);
  } else {
    job.then(() => undefined);
  }
}
