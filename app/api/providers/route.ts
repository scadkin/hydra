/**
 * GET /api/providers
 *
 * Returns the list of active providers (those with API keys set).
 * Only these providers will respond to queries.
 */

import { getActiveProviders } from "@/lib/providers";

export async function GET() {
  const active = getActiveProviders();
  return Response.json(
    active.map(({ id, name, color, model }) => ({ id, name, color, model }))
  );
}
