export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).send("Method not allowed");
    }

    const { action, data } = req.body || {};

    const notionToken = process.env.NOTION_TOKEN;
    const databaseId = process.env.NOTION_DATABASE_ID;

    if (!notionToken || !databaseId) {
      return res.status(500).send("Missing NOTION_TOKEN or NOTION_DATABASE_ID");
    }

    const headers = {
      Authorization: `Bearer ${notionToken}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    };

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

    if (action === "list") {
      const r = await fetch(
        `https://api.notion.com/v1/databases/${databaseId}/query`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            sorts: [
              {
                property: "日期",
                direction: "descending",
              },
            ],
          }),
        }
      );

      const text = await r.text();
      return res.status(r.status).send(text);
    }

    return res.status(400).send("Invalid action");
  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).send(err.message || "Server error");
  }
}
