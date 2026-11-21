# CRM + AI assistant

Built 21 Nov 2026. Menu: **CRM** (Today · Portfolio · Prospects · Ask the assistant). Works fully without the AI; the assistant is an add-on.

## What is computed from your data (no AI)
- **Business type + district** of every customer: confirmed value if someone set it on the customer's CRM card, else a guess from the name / address (`server/utils/crm.ts`).
- **Health label** per customer — Risky, Slipping, Dormant, Growing, Loyal, Steady, Never bought — with the reasons and suggested next steps (win-back call, collect first, credit review, cross-sell). Credit limits under ৳1,000 are treated as "no real limit set" (many accounts carry a placeholder such as ৳10).
- **Portfolio assessment**: concentration (top 1/5/10/20 share), mix by type / district / branch / product, credit exposure, data gaps.
- **Prospect assessment**: fit score, estimated monthly potential (a range from similar customers, or from the declared monthly use), risk flags (already a customer, matches an inactive customer, no references / licence), suggested first-order terms (advance %, starting limit, step-up), what is still unknown, confidence.
- Tasks, promises-to-pay and a contact log for customers and prospects.

## The AI assistant (Claude)
- Off until an admin switches it on in **Admin → Settings → Maintenance → CRM Assistant (AI)** *and* the server has a key.
- **Key:** add `NUXT_ANTHROPIC_API_KEY=...` to the server's `.env` (never in chat, code or git), then restart the app. Optional `NUXT_CRM_AGENT_MODEL` (default `claude-opus-5-5`; `claude-sonnet-5-5` is cheaper).
- **What it can do:** read the portfolio / customers / prospects through fixed tools, explain them, draft SMS / WhatsApp / email, and — only when asked — add a prospect (with its source), a note, or a task. With "web search" on it can look for prospects on the public web.
- **What it can never do:** change money, orders, credit limits or approvals, or send anything to anyone. Credit-limit and terms ideas are suggestions for your normal approval.
- **Safeguards:** every figure comes from a tool, not from the model; it acts as the signed-in user (branch scope applies); phone numbers are hidden from it by default; a daily question cap; every question, tools used and token count is logged (`crm_agent_log`); contact details for prospects must come with a source link.
- **Privacy:** customer names, balances and order history that a question needs are sent to Anthropic's API to answer it. Phone numbers are masked unless that box is unticked.
- **Not yet tested against the live API** (no key was available when it was built): the first real question may need small fixes. Draft messages fall back to a plain template if the API is unavailable.

## Next
Daily Telegram "morning brief" per collector / rep, the Telegram `/ask` bot, WhatsApp / SMS sending through a registered gateway, and outcome tracking (predicted vs actual volume and payment of won prospects).

## CRM phase 2 — reorder radar, forecast, messaging, route, results

Pages (CRM menu): **Today** (next-best-action list), **Insights** (reorder radar · cross-sell · forecast), **Route & territory**, **Messages**, **Results**.

- **Reorder radar / churn %** — per customer with ≥ 4 order dates: usual gap = median days between recent orders (never under 7); expected date = last order + gap; slipping % = how far the silence exceeds the gap, in units of that customer's own variability (rule of thumb).
- **Cross-sell** — per business type, products ≥ 25 % of buyers purchase; customers who buy none are suggested it, valued from peers' spend scaled to their size.
- **Forecast** — 0.5 × last-3-month avg + 0.5 × last-12-month avg (first month on record skipped, it is partial); adds a same-month-last-year factor only when two years of data exist and back-testing says it helps. Error band = back-tested miss on the last ≤ 6 months (min ±15 % while history is under 4 months).
- **Morning brief** — Telegram, once a day after the hour in Settings → CRM (default 08:00 Dhaka, off on Friday). Cron: every 30 min `curl -s "https://cerp.ujjalfm.com/api/cron/crm-brief?token=$NUXT_CRON_SECRET"`; add `&force=1` to send a test right now. Falls back to the first CRM → Today visit after that hour.
- **Visits** — "Capture my location" on a contact log stores GPS on that entry; tick "Save as this place's location" to pin the customer/prospect for the route planner. "Dictate" uses the browser's speech recognition (Bangla or English).
- **Route** — pick stops, nearest-neighbour order from the mill / your location, Google Maps link, one-click visit tasks. Un-pinned places sit at the district centre (≈).
- **Messaging** — OFF until Settings → CRM → "Allow staff to send" is ticked. A person always presses Send. Numbers that reply STOP/বন্ধ go on a do-not-contact list; daily cap applies. Every message is logged on the card.
  Server `.env` (never in code or chat):
  - SMS: `NUXT_SMS_GATEWAY_URL` (use `{to}` `{text}` `{key}`), optional `NUXT_SMS_GATEWAY_BODY` (JSON template, makes it POST), `NUXT_SMS_GATEWAY_KEY`, optional `NUXT_SMS_GATEWAY_OK_MATCH` (regex the reply must match).
  - Inbound SMS: point the gateway's delivery/reply webhook to `https://cerp.ujjalfm.com/api/hook/sms?token=<NUXT_CRM_WEBHOOK_SECRET>` with fields `from` and `text`.
  - WhatsApp Cloud API: `NUXT_WHATSAPP_TOKEN`, `NUXT_WHATSAPP_PHONE_ID`, `NUXT_WHATSAPP_VERIFY_TOKEN`, `NUXT_WHATSAPP_APP_SECRET`, and `NUXT_WHATSAPP_TEMPLATE` (+ `_LANG`) — WhatsApp only allows free text within 24 h of the customer's last message; a conversation start needs an approved template. Webhook URL: `https://cerp.ujjalfm.com/api/hook/whatsapp`.
  - Until a provider is connected, "Open in WhatsApp / SMS app" on every draft works from the staff member's own phone and logs the contact.
- **Company phone** — drafts show `[PHONE]` (and refuse to send) until the real number is set in Settings → Company; it is still the install placeholder.
- **Results** — contacts → order/payment within 14 days (by channel and by account state at the time), promises kept, task punctuality, prospect win rate, and whether higher fit scores really win.
