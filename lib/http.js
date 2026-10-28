function send(res, status, payload) {
  return res.status(status).json(payload);
}

function parsePositiveId(value) {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

function validateFruit(body, { partial = false } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be a JSON object." };
  }

  const output = {};
  if (!partial || Object.hasOwn(body, "name")) {
    if (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 100) {
      return { error: "name must be a non-empty string of at most 100 characters." };
    }
    output.name = body.name.trim();
  }

  if (!partial || Object.hasOwn(body, "price")) {
    const price = body.price;
    if (price === "" || price === null || price === undefined || !Number.isFinite(Number(price)) || Number(price) < 0 || Number(price) > 99999999.99) {
      return { error: "price must be a valid non-negative number." };
    }
    output.price = Number(price);
  }

  if (!partial || Object.hasOwn(body, "quantity")) {
    const quantity = body.quantity === undefined && !partial ? 0 : body.quantity;
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 0 || Number(quantity) > 2147483647) {
      return { error: "quantity must be a non-negative integer." };
    }
    output.quantity = Number(quantity);
  }

  if (Object.hasOwn(body, "image")) {
    if (body.image !== null && (typeof body.image !== "string" || body.image.length > 500)) {
      return { error: "image must be a URL/path string up to 500 characters, or null." };
    }
    output.image = body.image;
  }

  return { value: output };
}

function methodNotAllowed(res, allowed) {
  res.setHeader("Allow", allowed.join(", "));
  return send(res, 405, { success: false, message: "Method not allowed." });
}

module.exports = { send, parsePositiveId, validateFruit, methodNotAllowed };
