/**
 * GET /api/providers
 *
 * Returns the list of all configured providers (id, name, color, model).
 * This does NOT reveal which providers are enabled — that stays server-side.
 */

import { getAllProviders } from "@/lib/providers";

export async function GET() {
  return Response.json(getAllProviders());
}
