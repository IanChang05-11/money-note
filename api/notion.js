export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { action, data } = req.body;

  const headers = {
    Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };

  if (action === "test") {
    const r = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}`,
      { method: "GET", headers }
    );

    return res.status(r.status).send(await r.text());
  }

  if (action === "add") {
    const r = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    return res.status(r.status).send(await r.text());
  }

  return res.status(400).send("Invalid action");
}
