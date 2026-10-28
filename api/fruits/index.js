const { getPool } = require("../../lib/db");
const { send, validateFruit, methodNotAllowed } = require("../../lib/http");

module.exports = async function handler(req, res) {
  try {
    const db = getPool();

    if (req.method === "GET") {
      const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 100) : "";
      let rows;
      if (search) {
        const [result] = await db.execute(
          "SELECT id, name, price, quantity, image, created_at FROM fruits WHERE name LIKE ? ORDER BY id DESC",
          [`%${search}%`]
        );
        rows = result;
      } else {
        const [result] = await db.execute(
          "SELECT id, name, price, quantity, image, created_at FROM fruits ORDER BY id DESC"
        );
        rows = result;
      }
      return send(res, 200, { success: true, count: rows.length, data: rows });
    }

    if (req.method === "POST") {
      const validated = validateFruit(req.body);
      if (validated.error) return send(res, 400, { success: false, message: validated.error });

      const { name, price, quantity, image = null } = validated.value;
      const [result] = await db.execute(
        "INSERT INTO fruits (name, price, quantity, image) VALUES (?, ?, ?, ?)",
        [name, price, quantity, image]
      );
      const [rows] = await db.execute(
        "SELECT id, name, price, quantity, image, created_at FROM fruits WHERE id = ?",
        [result.insertId]
      );
      return send(res, 201, { success: true, message: "Fruit created successfully.", data: rows[0] });
    }

    return methodNotAllowed(res, ["GET", "POST"]);
  } catch (error) {
    console.error("Fruit collection API error:", error.message);
    return send(res, 500, { success: false, message: "Server or database error. Check Vercel function logs and database environment variables." });
  }
};
