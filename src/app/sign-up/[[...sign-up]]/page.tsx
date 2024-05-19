import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <SignUp
        forceRedirectUrl={
          process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL
        }
      />
    </div>
  );
}
