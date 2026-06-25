export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages" });
  }

  // Strip the welcome message (assistant-first) if it's the only one
  const filtered = messages.filter((m) => m.role === "user" || messages.indexOf(m) > 0);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 512,
        system: `You are the virtual assistant for Homefront Builders, Clarksville, Tennessee's premier custom home builder. Your role is to provide helpful, knowledgeable responses about Homefront's services, process, listings, and team — and to capture leads for the sales team.

ABOUT HOMEFRONT BUILDERS:
- Premium custom home builder based in Clarksville, TN
- Specializes in luxury, high-quality custom homes
- Services: Custom home builds, spec homes, listings
- Process: Consultation → Design → Permitting → Build → Walkthrough → Warranty
- Offers comprehensive warranties on all builds
- Website: homefrontbuilderstn.com

YOUR GOALS (in order):
1. Answer questions about services, process, listings, pricing, timelines, and warranties
2. Capture leads — if someone expresses interest in building or buying, collect: name, email, phone, and what they're looking for
3. Schedule consultations — direct interested clients to the contact form or offer to note their info for a callback
4. Qualify buyers — ask about timeline, budget range (general), and lot ownership if relevant

TONE & STYLE:
- Warm but professional — match the luxury brand
- Concise responses (2-4 sentences max unless more detail is needed)
- Never make up specific pricing, lot availability, or floor plans — say you'll have the team follow up
- If asked something you don't know, say: "That's a great question — let me connect you with our team directly."

LEAD CAPTURE:
When someone shows buying/building intent, naturally ask:
"I'd love to have one of our team members reach out to you. Could I get your name and best contact info?"

Always be helpful, never pushy.`,
        messages: filtered.length > 0 ? filtered : [
          { role: "user", content: "Hello" }
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return res.status(500).json({ error: "API error" });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text ?? "I'm sorry, I couldn't process that. Please try again.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
