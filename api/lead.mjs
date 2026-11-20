/**
 * Vercel-udgaven af lead-funktionen (samme kode som netlify/functions/lead.mjs). Svarer på POST /api/lead.
 */
import haandter from '../netlify/functions/lead.mjs';

export function POST(req) {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || undefined;
  return haandter(req, { ip });
}
