export default async function handler(req, res) {
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const DATABASE_ID = process.env.NOTION_DATABASE_ID;

  const headers = {
    "Authorization": `Bearer ${NOTION_TOKEN}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json"
  };

  try {
    const { action, data, pageId } = req.body || {};

    // 🔍 1. 測試連線
    if (action === "test") {
      return res.status(200).json({ ok: true });
    }

    // 📥 2. 讀取資料
    if (action === "list") {
      const notionRes = await fetch(
        `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
        {
          method: "POST",
          headers
        }
      );

      const result = await notionRes.json();
      return res.status(200).json(result);
    }

    // ➕ 3. 新增資料
    if (action === "add") {
      const notionRes = await fetch(
        "https://api.notion.com/v1/pages",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            parent: { database_id: DATABASE_ID },
            properties: data.properties
          })
        }
      );

      const result = await notionRes.json();
      return res.status(200).json(result);
    }

    // ❌ 4. 刪除（其實是 archive）
    if (action === "delete") {
      if (!pageId) {
        return res.status(400).json({ error: "Missing pageId" });
      }

      const notionRes = await fetch(
        `https://api.notion.com/v1/pages/${pageId}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            archived: true
          })
        }
      );

      const result = await notionRes.json();
      return res.status(200).json(result);
    }

    return res.status(400).json({ error: "Invalid action" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
