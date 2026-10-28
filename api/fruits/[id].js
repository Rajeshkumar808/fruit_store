const { getPool } = require("../../lib/db");
const { send, parsePositiveId, validateFruit, methodNotAllowed } = require("../../lib/http");

module.exports = async function handler(req, res) {
  const id = parsePositiveId(req.query.id);
  if (!id) return send(res, 400, { success: false, message: "A valid positive fruit ID is required." });

  try {
    const db = getPool();

    if (req.method === "GET") {
      const [rows] = await db.execute(
        "SELECT id, name, price, quantity, image, created_at FROM fruits WHERE id = ?",
        [id]
      );
      if (!rows.length) return send(res, 404, { success: false, message: "Fruit not found." });
      return send(res, 200, { success: true, data: rows[0] });
    }

    if (req.method === "PUT") {
      const validated = validateFruit(req.body);
      if (validated.error) return send(res, 400, { success: false, message: validated.error });

      const { name, price, quantity, image = null } = validated.value;
      const [result] = await db.execute(
        "UPDATE fruits SET name = ?, price = ?, quantity = ?, image = ? WHERE id = ?",
        [name, price, quantity, image, id]
      );
      if (!result.affectedRows) {
        const [rows] = await db.execute("SELECT id FROM fruits WHERE id = ?", [id]);
        if (!rows.length) return send(res, 404, { success: false, message: "Fruit not found." });
      }
      const [rows] = await db.execute(
        "SELECT id, name, price, quantity, image, created_at FROM fruits WHERE id = ?",
        [id]
      );
      return send(res, 200, { success: true, message: "Fruit updated successfully.", data: rows[0] });
    }

    if (req.method === "DELETE") {
      const [result] = await db.execute("DELETE FROM fruits WHERE id = ?", [id]);
      if (!result.affectedRows) return send(res, 404, { success: false, message: "Fruit not found." });
      return send(res, 200, { success: true, message: "Fruit deleted successfully." });
    }

    return methodNotAllowed(res, ["GET", "PUT", "DELETE"]);
  } catch (error) {
    console.error("Fruit item API error:", error.message);
    return send(res, 500, { success: false, message: "Server or database error. Check Vercel function logs and database environment variables." });
  }
};
