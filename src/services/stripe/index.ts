import { getUserByClerkSub } from "@/app/api/user/actions";
import { SubscriptionPlanEnum } from "@prisma/client";
import Stripe from "stripe";

export const stripe = new Stripe(
  process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || "",
  {
    apiVersion: "2024-04-10",
  }
);

export const CARD = "card";
export const SUBSCRIPTION = "subscription";
export const PAYMENT = "payment";

interface CreateCheckoutSession {
  clerkSub: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  plan: SubscriptionPlanEnum;
}

export const getStripeCustomer = async (data: { clerkSub: string }) => {
  const user = await getUserByClerkSub(data.clerkSub);

  if (!user) {
    throw new Error("User not found while checking for stripe customer");
  }

  try {
    const stripeCustomer = await stripe.customers.search({
      query: `email: '${user.email}'`,
    });

    return stripeCustomer.data;
  } catch (error) {
    console.error("🚨 - Stripe customer error - 🚨", error);
    throw new Error("Error checking for stripe customer");
  }
};

export const createCheckoutSession = async ({
  clerkSub,
  priceId,
  successUrl,
  cancelUrl,
  plan,
}: CreateCheckoutSession) => {
  let stripeCustomerId: string;
  const user = await getUserByClerkSub(clerkSub);

  if (!user) {
    throw new Error("User not found while creating checkout session");
  }
  try {
    const stripeCustomer = await getStripeCustomer({ clerkSub });

    if (stripeCustomer.length > 0 && stripeCustomer[0].id) {
      stripeCustomerId = stripeCustomer[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
      });

      stripeCustomerId = customer.id;
    }

    const checkoutBody: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: [CARD],
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        // Uncomment the line below to enable trial period
        // trial_period_days: 14,
      },
      mode: SUBSCRIPTION,
      metadata: {
        // [Optional] Add plan as metadata to be used in webhook event
        plan,
        userId: user.id,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    };

    const session = await stripe.checkout.sessions.create(checkoutBody);
    return session.url;
  } catch (error) {
    console.error("🚨 - Checkout session error - 🚨", error);
    throw new Error("Error creating checkout session");
  }
};

export const createBillingPortalSession = async (data: {
  clerkSub?: string | null;
}) => {
  if (!data.clerkSub) {
    throw new Error(
      "Clerk sub not found while creating billing portal session"
    );
  }
  const user = await getUserByClerkSub(data.clerkSub);

  if (!user) {
    throw new Error("User not found while creating billing portal session");
  }

  try {
    const stripeCustomer = await stripe.customers.search({
      query: `email: '${user.email}'`,
    });

    if (stripeCustomer.data.length > 0) {
      const session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomer.data[0].id,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      });

      return session.url;
    }

    throw new Error("Stripe customer not found");
  } catch (error) {
    console.error("🚨 - Billing portal session error - 🚨", error);
    throw new Error("Error creating billing portal session");
  }
};
