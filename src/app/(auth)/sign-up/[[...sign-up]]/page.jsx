"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            And start your bike booking journey
          </p>
        </div>
        
        <SignUp 
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          redirectUrl="/bikes"
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-primary hover:bg-primary-600 text-white rounded-md px-4 py-2",
              card: "rounded-md shadow-sm",
              formFieldInput: 
                "rounded-md border-gray-300 focus:border-primary focus:ring-primary",
              footerActionLink: "text-primary hover:text-primary-600"
            }
          }}
          // Only use phone authentication
          initialValues={{
            verifications: {
              phoneCode: {}
            },
            firstName: '',
            lastName: ''
          }}
        />
      </div>
    </div>
  );
}