/**
 * Every successful response follows the same shape:
 *   { success: true, data: <payload>, meta?: <pagination/etc> }
 * Keeping this in one helper means every controller returns identical
 * envelopes without repeating the boilerplate.
 */
function sendSuccess(res, { statusCode = 200, data = null, meta = undefined, message = undefined }) {
  const body = { success: true };
  if (message) body.message = message;
  body.data = data;
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess };
