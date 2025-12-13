import Link from "next/link";
import { CardCompact } from "@/components/card-compact";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { passwordForgotPath, signUpPath } from "@/paths";

const SignInPage = () => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center">
      <CardCompact
        title="Login"
        description="Entre em sua conta para continuar"
        className="w-full max-w-[420px] animate-fade-from-top"
        content={<SignInForm />}
        footer={
          <>
            <Link className="text-sm text-muted-foreground" href={signUpPath()}>
              Ainda não tem conta?
            </Link>

            {/* <Link
              className="text-sm text-muted-foreground"
              href={passwordForgotPath()}
            >
              Forgot Password?
            </Link> */}
          </>
        }
      />
    </div>
  );
};

export default SignInPage;
