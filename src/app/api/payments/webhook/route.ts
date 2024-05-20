import { plans } from "@/lib/subscription-plans";
import prisma from "@/prisma";
import { SubscriptionPlanEnum } from "@prisma/client";
import Cors from "micro-cors";
import { NextRequest, NextResponse } from "next/server";
import stripe from "stripe";

const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});

const secret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    let event;
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    if (!signature) {
      throw new Error("No signature found in headers for stripe webhook");
    }

    try {
      event = stripe.webhooks.constructEvent(body, signature, secret);

      if (event.type === "customer.created") {
        const session = event.data.object;

        const user = await prisma.user.findUnique({
          where: {
            email: session.email!,
          },
        });

        if (!user) {
          throw new Error(
            `Stripe webhook error\n-User not found on customer.created event\n-Email: ${session.email} `
          );
        }
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        const user = await prisma.user.findUnique({
          where: {
            id: session.metadata?.userId,
          },
        });

        if (!user) {
          throw new Error(
            `Stripe webhook error\n-User not found on checkout.session.completed event\n-Stripe customer: ${session.customer} `
          );
        }

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            plan: session.metadata?.plan as SubscriptionPlanEnum,
          },
        });

        const userSub = await prisma.userSubscription.findFirst({
          where: {
            userId: user.id,
          },
        });

        const priceIdByPlan = plans.find(
          (plan) => plan.value === session.metadata?.plan
        )?.priceId;

        if (!session.customer || !priceIdByPlan || !session.subscription) {
          throw new Error("Invalid session data");
        }

        if (!userSub) {
          await prisma.userSubscription.create({
            data: {
              userId: user.id,
              customerId: session.customer as string,
              priceId: priceIdByPlan,
              subscriptionId: session.subscription as string,
            },
          });
        } else {
          await prisma.userSubscription.update({
            where: {
              id: userSub.id,
            },
            data: {
              customerId: session.customer as string,
              priceId: priceIdByPlan,
              subscriptionId: session.subscription as string,
            },
          });
        }
      } else if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object;

        const userSub = await prisma.userSubscription.findFirst({
          where: {
            subscriptionId: subscription.id,
          },
          include: {
            user: true,
          },
        });

        if (!userSub) {
          throw new Error(
            `Stripe webhook error\n-User not found on customer.subscription.deleted event\n-Stripe Customer: ${subscription.customer} `
          );
        }

        await prisma.userSubscription.update({
          where: {
            id: userSub.id,
          },
          data: {
            canceledAt: new Date(),
          },
        });

        await prisma.user.update({
          where: {
            id: userSub.userId,
          },
          data: {
            plan: SubscriptionPlanEnum.FREE,
          },
        });
      } else if (event.type === "customer.subscription.updated") {
        const subscription = event.data.object;

        const userSub = await prisma.userSubscription.findFirst({
          where: {
            subscriptionId: subscription.id,
          },
          include: {
            user: true,
          },
        });

        if (!userSub) {
          throw new Error(
            `Stripe webhook error\n-User not found on customer.subscription.updated event\n-Stripe Customer: ${subscription.customer} `
          );
        }

        const plan = plans.find(
          (plan) => plan.priceId === subscription.items.data[0].price.id
        )?.value;

        await prisma.userSubscription.update({
          where: {
            id: userSub.id,
          },
          data: {
            priceId: subscription.items.data[0].price.id,
          },
        });

        await prisma.user.update({
          where: {
            id: userSub.userId,
          },
          data: {
            plan: plan as SubscriptionPlanEnum,
          },
        });
      } else if (event.type === "customer.subscription.resumed") {
        const subscription = event.data.object;

        const userSub = await prisma.userSubscription.findFirst({
          where: {
            subscriptionId: subscription.id,
          },
          include: {
            user: true,
          },
        });

        if (!userSub) {
          throw new Error(
            `Stripe webhook error\n-User not found on customer.subscription.resumed event\n-Stripe Customer: ${subscription.customer} `
          );
        }

        await prisma.userSubscription.update({
          where: {
            id: userSub.id,
          },
          data: {
            canceledAt: null,
            renewedAt: new Date(),
          },
        });

        const plan = plans.find(
          (plan) => plan.priceId === subscription.items.data[0].price.id
        )?.value;

        await prisma.user.update({
          where: {
            id: userSub.userId,
          },
          data: {
            plan: plan as SubscriptionPlanEnum,
          },
        });
      }
    } catch (err) {
      console.error("Error in stripe webhook", err);
      return NextResponse.json({ status: 200 });
    }
  }

  return NextResponse.json({ message: "Success" });
}
