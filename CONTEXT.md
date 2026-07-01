# WS Energy — Context

Domain glossary for the WS Energy marketing site. Defines the canonical terms used across the codebase so the language in the UI, Sanity schemas, and component names stays consistent.

## Language

### Customer-facing tools

**Estimator** (canonical: "Solar Rooftop Estimator"):
A self-serve, instant, non-binding tool that takes a roof and electricity-usage profile and returns a recommended system size, savings, payback, environmental impact, and an install/skip verdict. Anonymous — requires no contact details and creates no sales obligation. Its job ends by handing the user into the _Quote_ flow.
_Avoid_: Calculator (too generic), Quote, Configurator

**Estimate**:
The non-binding output of the _Estimator_ — a recommendation, not a price. Distinct from a _Quote_.
_Avoid_: Quote, Proposal

**Quote** (a.k.a. RFQ — "Request for Quote"):
The existing sales-driven path (`/quote`, `RfqForm`, `RfqSubmission`, `/api/rfq`). Captures contact details, is followed up by a human, and produces real pricing. The opposite of an _Estimate_: human, contact-captured, commitment-bearing.
_Avoid_: Estimate, Inquiry
