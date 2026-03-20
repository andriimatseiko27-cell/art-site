export async function handler(event) {
  const headers = {
    "Access-Control-Allow-Origin": "https://sofiia22.github.io",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true }),
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { name, phone, message } = JSON.parse(event.body || "{}");

    if (!name || !phone) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Name and phone are required" }),
      };
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Server env variables are missing" }),
      };
    }

    const text = [
      "🛠 New Estimate Request",
      "",
      `👤 Name: ${name}`,
      `📞 Phone: ${phone}`,
      `💬 Message: ${message?.trim() || "—"}`,
      `🕒 Time: ${new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      })}`,
    ].join("\n");

    const tgResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
        }),
      },
    );

    const tgData = await tgResponse.json();

    if (!tgResponse.ok || !tgData.ok) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: "Telegram request failed",
          details: tgData,
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Unexpected server error" }),
    };
  }
}
