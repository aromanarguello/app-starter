import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <SignUp
      /*👇🏽 Uncomment this if you are interested in having an explict redirect to a page after sign up*/
      // forceRedirectUrl={
      //   process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL
      // }
      />
    </div>
  );
}
