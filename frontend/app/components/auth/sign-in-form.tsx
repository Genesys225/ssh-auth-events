import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { useFetcher, useNavigation } from 'react-router';
import { DynamicLogo } from '~/components/logo';
import { RouterLink } from '~/components/link';
import { paths } from '~/lib/paths';
import { Alert, Box, Button, FormControl, FormHelperText, InputLabel, NoSsr, OutlinedInput, Stack, Typography } from '@mui/material';
import { loginAction } from '~/auth/client';

export const action = loginAction;


const schema = zod.object({
  username: zod.string().min(1, { message: 'Username is required' }),
  password: zod.string().min(1, { message: 'Password is required' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { username: '', password: '' } satisfies Values;

export default function SignInForm(): React.JSX.Element {
  const fetcher = useFetcher(); // Native fetcher for React Router actions
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  // Handle form submission using the fetcher
  const onSubmit = (values: Values) => {
    fetcher.submit(values, { method: 'post', action: '/login' });
  };

  return (
    <Stack spacing={4}>
      <div>
        <Box
          component={RouterLink}
          href={paths.home}
          sx={{ display: 'inline-block', fontSize: 0 }}
        >
          <NoSsr>
            <DynamicLogo colorDark="light" colorLight="dark" height={32} width={122} />
          </NoSsr>
        </Box>
      </div>
      <Stack spacing={1}>
        <Typography variant="h5">Sign in</Typography>
      </Stack>
      <Stack spacing={3}>
        <Stack spacing={2}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <Controller
                control={control}
                name="username"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.username)}>
                    <InputLabel>Username</InputLabel>
                    <OutlinedInput {...field} type="username" />
                    {errors.username ? (
                      <FormHelperText>{errors.username.message}</FormHelperText>
                    ) : null}
                  </FormControl>
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.password)}>
                    <InputLabel>Password</InputLabel>
                    <OutlinedInput
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      endAdornment={
                        showPassword ? (
                          <EyeIcon
                            cursor="pointer"
                            fontSize="var(--icon-fontSize-md)"
                            onClick={() => setShowPassword(false)}
                          />
                        ) : (
                          <EyeSlashIcon
                            cursor="pointer"
                            fontSize="var(--icon-fontSize-md)"
                            onClick={() => setShowPassword(true)}
                          />
                        )
                      }
                    />
                    {errors.password ? (
                      <FormHelperText>{errors.password.message}</FormHelperText>
                    ) : null}
                  </FormControl>
                )}
              />
              {fetcher.data?.error && <Alert color="error">{fetcher.data.error}</Alert>}
              <Button disabled={navigation.state === 'submitting'} type="submit" variant="contained">
                {navigation.state === 'submitting' ? 'Signing in...' : 'Sign in'}
              </Button>
            </Stack>
          </form>
        </Stack>
      </Stack>
    </Stack>
  );
}
