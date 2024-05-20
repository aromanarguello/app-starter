
## Getting Started

### Database
By default:

	•	PostgreSQL database
	•	Managed by Docker
	•	Prisma ORM

The directory includes a docker-compose.yml file. To set up your PostgreSQL database locally, run the following command:

```base
docker-compose up
```
To perform the initial migration:

	1.	Run `yarn migrate:dev` (or use your preferred package manager).
	2.	You will be prompted to name your migration. Press Enter to use the default name or provide a custom name.

This configuration can be swapped out at any time.

### Starting the server

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### Styling
The starter kit includes [shadcn](https://ui.shadcn.com/). My favorite library ever. It uses tailwind under the hood so you can just use tailwind. We've installed a few of the base components such as `input`, `button`, `select`, `toast`, and `form`.

### Forms and Validation
[React Hook Form](https://react-hook-form.com/) is installed to manage forms with [Zod](https://zod.dev/) for validation. There are a couple example components installed such as `controlled-input` and `controlled-select`

```javascript
export const ControlledInput = ({
  name,
  label,
  placeholder,
  type,
  min = 0,
}: Props) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel htmlFor={name}>{label}</FormLabel>
            <FormControl>
              <Input
                placeholder={placeholder}
                type={type}
                min={min}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

```

**Example Usage**

```javascript

const schema = z.object({
    firstName: z.string().min(0, formMessages.invalid)
})

type FormValues = z.infer<typeof schema>;

const FormComponent = () => {
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    return (
        <Form {...form}>
            <form>
                <ControlledInput 
                    name="firstName" 
                    label="First Name" 
                    placeholder="Alejandro Roman"
                />
            </form>
        </Form>
    )
}

```

### Authentication

The starter kit uses [Clerk](https://clerk.com/) by default. Follow these steps to set up authentication:

1.	Create an account with Clerk and obtain the following keys:
	•	Secret Key
	•	Publishable Key
2.	Set up webhooks in the Clerk dashboard to register users in your own database, storing a reference.

	•	Not mandatory, but recommended.

	•	Logic for handling user creation after sign-up is included in api/auth/webhook. This allows you to store the user’s email and Clerk sub (reference ID in Clerk) for easier management.

	•	Add the webhook secret to your .env file as CLERK_WEBHOOK_SECRET.
3.	(Optional) Add a forced redirect URL after user sign-up in the sign-up page.

	•	Set the path in the `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` variable in your `.env` file.

### Analytics with PostHog
1.  Create a Posthog account if you haven't.
2.	Add the following code to layout.tsx to enable PostHog:

Add the following code to `layout.tsx` in order to enable posthog

```javascript
export const PHPageView = dynamic(() => import("./posthog/page-viewer")); 👈 Add this


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <CSPostHogProvider> 👈 Add this
      <html lang="en">
        <body className={inter.className}>
          <PHPageView /> 👈 Add this
          {children}
          <Toaster />
        </body>
      </html>
      </CSPostHogProvider> 👈 Add this
    </ClerkProvider>
  );
}   
```

### Emailing with Loops

1.	Create a Loops Account

	•	Sign up for an account on [Loops](https://loops.so/).

	•	Once your account is set up, navigate to the dashboard to obtain your API keys.

2. Add your keys to the `.env` file

The starter kit includes a method to create contacts on Loops once a user has signed up.

```javascript
export const sendSignUpEvent = async (user: User) => {
  try {
    await loops.sendEvent({
      email: user.email,
      userId: user.id,
      eventName: "signup",
    });
  } catch (error) {
    console.error(
      `Error sending sign up event to loops:\n-Email: ${user.email}\n-ID: ${user.id}`,
      error
    );
    throw new Error("Error sending sign up event to loops");
  }
};
```

It also includes a very simple method to send transactional emails that I use everytime:

```javascript
export const sendTransactionalEmail = ({
  email,
  transactionalId,
  dataVariables,
}: TransactionalEmailInputInterface) => {
  return loops.sendTransactionalEmail(transactionalId, email, dataVariables);
};
```

### Payments with Stripe

This starter kit includes a boilerplate for integrating Stripe for payment processing, subscription management, and billing portal functionality.

Prerequisites

	1.	Stripe Account: Create an account on Stripe if you don’t have one.

	2.	Stripe API Keys: Obtain your Stripe Secret Key and Publishable Key from the Stripe Dashboard.

Environment Variables

Add the following environment variables to your `.env` file:

```javascript
NEXT_PUBLIC_STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_BASE_URL=your_base_url
```

**Usage**

1.	Get Stripe Customer: This function checks if a user already has a Stripe customer account by querying their email. If not found, it throws an error.

```javascript
const stripeCustomer = await getStripeCustomer({ clerkSub });
```

2.	Create Checkout Session: This function creates a Stripe checkout session for a subscription. It retrieves or creates a Stripe customer, sets up the checkout session, and returns the session URL.

```javascript
const sessionUrl = await createCheckoutSession({
  clerkSub,
  priceId,
  successUrl,
  cancelUrl,
});
```

3.	Create Billing Portal Session: This function creates a billing portal session for the user, allowing them to manage their subscription and payment methods.

```javascript
const billingPortalUrl = await createBillingPortalSession({ clerkSub });
```

Make sure to customize the functions as needed and handle errors appropriately in your application.
