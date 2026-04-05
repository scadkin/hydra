/**
 * GET /api/usage
 *
 * Returns usage stats for all providers tracked this session.
 */

import { getUsageStats } from "@/lib/usage";

export async function GET() {
  return Response.json(getUsageStats());
}
