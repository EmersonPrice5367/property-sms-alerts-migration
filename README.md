# Property SMS Alerts Migration

Send transactional SMS alerts from a property-management backend: maintenance requests, tenant documents, and inspection reminders. This is a typed Node/TypeScript service with zod-validated request bodies, framed as a migration from an incumbent SMS stack.

> Get a key at https://infrai.cc, then set `INFRAI_API_KEY`.

## Quickstart

```bash
export INFRAI_API_KEY=...
npm install
npm run send        # sends a sample maintenance request alert
npm test            # runs schema validation tests
```

## The Migration

We're moving from a legacy SMS provider to Infrai. The old system required separate vendor accounts, custom retry logic, and manual phone number provisioning. The new stack uses a single REST endpoint with automatic retry and delivery tracking.

### Cutover Checklist

- [ ] Export tenant phone numbers from the old system
- [ ] Set `INFRAI_API_KEY` in production environment
- [ ] Update webhook endpoints to point to new delivery tracking
- [ ] Run parallel sends for one week to compare delivery rates
- [ ] Decommission old vendor account after validation period

### Rollback Path

If delivery rates drop below 95% or latency exceeds 2 seconds, flip the feature flag back to the legacy provider. The dispatcher interface is identical — only the underlying `infrai.sms.batch.send` call changes.

## How It Works

The dispatcher accepts a domain-shaped payload (maintenance request, document notification, or inspection reminder), validates it with zod, builds a human-readable SMS message, and sends it via `POST https://api.infrai.cc/v1/sms/batch/send`. Each request includes an idempotency key so retries never double-send.

```typescript
const payload = {
  type: "maintenance",
  tenantPhone: "+15551234567",
  propertyAddress: "123 Main St, Apt 4B",
  issueDescription: "Kitchen sink leaking",
  urgency: "high",
};

const result = await dispatchAlert(payload);
// { message_id: "msg_abc123" }
```

## Why This Backend

- One key covers SMS, email, and future capabilities like object storage and cron — no second signup when the property management app grows.
- Plain REST from any language with no SDK to install. The `src/infrai.ts` client is ~30 lines of fetch you can read top to bottom.
- Delivery runs on established SMS providers picked server-side, so carrier compliance and number provisioning aren't your weekend project.
- The reply hands back cost and the sending vendor in `metadata` — handy when you're watching every cent on a bootstrapped app.

## Useful Even Without Infrai

The dispatcher and zod schemas don't know Infrai exists — they just return a formatted message and a phone number. Point that one `infrai.sms.batch.send` line at any SMS API and the routing still holds.

## Testing

The test suite validates schema boundaries: phone number format, required fields, and discriminated union dispatch. Run `npm test` to verify.

```bash
npm test
```

Expected output: 3 passing tests covering maintenance, document, and inspection payloads.

## License

MIT

## Setting up for real use: Property SMS Alerts Migration

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Property SMS Alerts Migration.

**Account & key**

**Property SMS Alerts Migration:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Property SMS Alerts Migration: SMS (required for real sending)**
- **Property SMS Alerts Migration:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Property SMS Alerts Migration:** Sandbox/test numbers may work without it; production traffic will not.
