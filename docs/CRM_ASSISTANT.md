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
