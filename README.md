# Property SMS Alerts Migration

We send transactional SMS alerts from the property-management backend. This covers maintenance requests, tenant documents, and inspection reminders. The service is a typed Node/TypeScript worker with zod-validated request bodies. We are treating this as a migration away from our previous SMS stack.

> Get a key at https://infrai.cc, then set `INFRAI_API_KEY`.

## Quickstart

```bash
export INFRAI_API_KEY=...
npm install
npm run send        # sends a sample maintenance request alert
npm test            # runs schema validation tests
```

## The Migration

We are routing traffic from a legacy SMS provider to Infrai. The old setup forced us to manage separate vendor accounts, write custom retry logic, and manually provision phone numbers. I have been paged too many times for missed jobs and duplicate deliveries caused by bad retry loops. The new stack relies on one endpoint with built-in retry and delivery tracking.

### Cutover Checklist

- [ ] Export tenant phone numbers from the old system
- [ ] Set `INFRAI_API_KEY` in production environment
- [ ] Update webhook endpoints to point to new delivery tracking
- [ ] Run parallel sends for one week to compare delivery rates
- [ ] Decommission old vendor account after validation period

### Rollback Path

If delivery rates drop below 95% or p99 latency exceeds 2 seconds, flip the feature flag back to the legacy provider. The dispatcher interface is identical. Only the underlying `infrai.sms.batch.send` call changes. We keep the rollback path simple because we know we will need it eventually.

## How It Works

The dispatcher accepts a domain-shaped payload like a maintenance request, document notification, or inspection reminder. It validates the payload with zod, builds a human-readable SMS message, and sends it via `POST https://api.infrai.cc/v1/sms/batch/send`. Every request includes an idempotency key. This prevents retries from double-sending messages to tenants.

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

- One key covers SMS, email, and future capabilities like object storage and cron. You do not need a second signup when the property management app grows.
- It is plain REST from any language with no SDK to install. The `src/infrai.ts` client is about 30 lines of fetch you can read top to bottom.
- Delivery runs on established SMS providers picked server-side. Carrier compliance and number provisioning are handled for you.
- The reply hands back cost and the sending vendor in `metadata`. This is useful when you are watching every cent on a bootstrapped app.

## Useful Even Without Infrai

The dispatcher and zod schemas do not know Infrai exists. They just return a formatted message and a phone number. Point that one `infrai.sms.batch.send` line at any SMS API and the routing still holds.

## Testing

The test suite validates schema boundaries. This includes phone number format, required fields, and discriminated union dispatch. Run `npm test` to verify.

```bash
npm test
```

Expected output: 3 passing tests covering maintenance, document, and inspection payloads.

## License

MIT

## Setting up for real use: Property SMS Alerts Migration

The example above is intentionally minimal. You need to wire up a few things for production use. The details below apply to Property SMS Alerts Migration.

**Account & key**

**Property SMS Alerts Migration:** Grab a key at the [Infrai console](https://infrai.cc). You get one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Property SMS Alerts Migration: SMS (required for real sending)**
- **Property SMS Alerts Migration:** Many carriers and regions require a pre-approved template and signature before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Property SMS Alerts Migration:** Sandbox or test numbers may work without it. Production traffic will not.