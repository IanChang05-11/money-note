export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { action, data } = req.body || {};

  const notionToken = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!notionToken || !databaseId) {
    return res.status(500).json({
      error: "Missing NOTION_TOKEN or NOTION_DATABASE_ID",
    });
  }

  const headers = {
    Authorization: `Bearer ${notionToken}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };

  try {
    if (action === "test") {
      const r = await fetch(
        `https://api.notion.com/v1/databases/${databaseId}`,
        {
          method: "GET",
          headers,
        }
      );

      const text = await r.text();
      return res.status(r.status).send(text);
    }

    if (action === "add") {
      const payload = {
        ...data,
        parent: {
          database_id: databaseId,
        },
      };

      const r = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const text = await r.text();
      return res.status(r.status).send(text);
    }

    return res.status(400).json({
      error: "Invalid action",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
}
