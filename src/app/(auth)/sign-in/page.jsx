import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sign in to your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            And start booking your bike today
          </p>
        </div>
        <SignIn appearance={{
          elements: {
            formButtonPrimary: 'bg-primary hover:bg-primary-600 text-sm normal-case',
          }
        }} />
      </div>
    </div>
  );
}