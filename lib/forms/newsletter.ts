import { newsletterSchema, type NewsletterInput } from "@/lib/validators";

type Provider = "none" | "mailchimp" | "convertkit" | "beehiiv" | "webhook";

type ProviderConfig = {
  endpoint?: string;
  transform?: (email: string) => Record<string, unknown>;
};

const providers: Record<Exclude<Provider, "none">, ProviderConfig> = {
  mailchimp: {
    endpoint: process.env.MAILCHIMP_SUBSCRIBE_URL,
    transform: (email) => ({ email }),
  },
  convertkit: {
    endpoint: process.env.CONVERTKIT_SUBSCRIBE_URL,
    transform: (email) => ({ email }),
  },
  beehiiv: {
    endpoint: process.env.BEEHIIV_SUBSCRIBE_URL,
    transform: (email) => ({ email }),
  },
  webhook: {
    endpoint: process.env.NEWSLETTER_WEBHOOK_URL,
    transform: (email) => ({ email }),
  },
};

export async function handleNewsletterSignup(payload: NewsletterInput) {
  const parsed = newsletterSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Please enter a valid email address.",
    };
  }

  const provider = (process.env.NEWSLETTER_PROVIDER || "none") as Provider;

  if (provider === "none") {
    return {
      ok: true,
      message:
        "Newsletter UI is ready. Connect Beehiiv, ConvertKit, Mailchimp, or a webhook to collect subscribers in production.",
    };
  }

  const config = providers[provider];

  if (!config?.endpoint) {
    return {
      ok: false,
      message: `The ${provider} adapter is selected but not configured yet.`,
    };
  }

  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config.transform?.(parsed.data.email) ?? parsed.data),
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      ok: false,
      message: "We could not save your subscription right now. Please try again shortly.",
    };
  }

  return {
    ok: true,
    message: "You are subscribed. Look out for the next letter from Mariam.",
  };
}
