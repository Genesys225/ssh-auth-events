import * as React from 'react';
import { loginAction } from '~/auth/client';
import { AuthLayout } from '~/components/auth/auth-layout';
import SignInForm from '~/components/auth/sign-in-form';

export const action = loginAction;


export default function SignInPage(): React.JSX.Element {
  return (
    <AuthLayout>
      <SignInForm />
    </AuthLayout>
  );
}
