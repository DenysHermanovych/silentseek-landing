export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, company, message } = req.body;

    // Validate required fields
    if (!name || !email || !company) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
        console.error('Missing Telegram env vars');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    // Build the Telegram message
    const text = [
        `🚀 <b>New Demo Request — SilentSeek</b>`,
        ``,
        `👤 <b>Name:</b> ${escapeHtml(name)}`,
        `📧 <b>Email:</b> ${escapeHtml(email)}`,
        `🏢 <b>Company:</b> ${escapeHtml(company)}`,
        message ? `💬 <b>Message:</b> ${escapeHtml(message)}` : `💬 <b>Message:</b> —`,
        ``,
        `🕐 ${new Date().toUTCString()}`,
    ].join('\n');

    try {
        const telegramRes = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text,
                    parse_mode: 'HTML',
                }),
            }
        );

        const telegramData = await telegramRes.json();

        if (!telegramData.ok) {
            console.error('Telegram API error:', telegramData);
            return res.status(500).json({ error: 'Failed to send Telegram message' });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Fetch error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
