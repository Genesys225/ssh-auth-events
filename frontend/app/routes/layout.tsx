import { Box, GlobalStyles } from '@mui/material';
import { layoutConfig } from './config';
import { appConfig } from '~/config/app-config';
import { SideNav } from '~/components/nav/side-nav';
import { MainNav } from '~/components/nav/main-nav';
import { Outlet, type LayoutRouteProps } from 'react-router';



export interface VerticalLayoutProps {
  children?: React.ReactNode;
}

export default function Layout(_props: LayoutRouteProps): React.JSX.Element {
  return (
    <>
      <GlobalStyles
        styles={{
          body: {
            '--MainNav-height': '56px',
            '--MainNav-zIndex': 1000,
            '--SideNav-width': '280px',
            '--SideNav-zIndex': 1100,
            '--MobileNav-width': '320px',
            '--MobileNav-zIndex': 1100,
          },
        }}
      />
      <Box
        sx={{
          bgcolor: 'var(--mui-palette-background-default)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          minHeight: '100%',
        }}
      >
        <SideNav color={appConfig.navColor} items={layoutConfig.navItems} />
        <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column', pl: { lg: 'var(--SideNav-width)' } }}>
          <MainNav items={layoutConfig.navItems} />
          <Box
            component="main"
            sx={{
              '--Content-margin': '0 auto',
              '--Content-maxWidth': 'var(--maxWidth-xl)',
              '--Content-paddingX': '24px',
              '--Content-paddingY': { xs: '24px', lg: '64px' },
              '--Content-padding': 'var(--Content-paddingY) var(--Content-paddingX)',
              '--Content-width': '100%',
              display: 'flex',
              flex: '1 1 auto',
              flexDirection: 'column',
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </>
  );
}
