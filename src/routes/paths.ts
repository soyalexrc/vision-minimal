// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    two: `${ROOTS.DASHBOARD}/two`,
    three: `${ROOTS.DASHBOARD}/three`,
    clients: {
      root: `${ROOTS.DASHBOARD}/clients`,
      list: `${ROOTS.DASHBOARD}/clients`,
      create: `${ROOTS.DASHBOARD}/clients/new`,
      edit: (id: number | string) => `${ROOTS.DASHBOARD}/clients/update/${id}`,
      details: (id: number | string) => `${ROOTS.DASHBOARD}/clients/view/${id}`,
    },
    allies: {
      root: `${ROOTS.DASHBOARD}/allies`,
      list: `${ROOTS.DASHBOARD}/allies`,
      create: `${ROOTS.DASHBOARD}/allies/new`,
      edit: (id: number) => `${ROOTS.DASHBOARD}/allies/update/${id}`,
      details: (id: number) => `${ROOTS.DASHBOARD}/allies/view/${id}`,
    },
    users: {
      root: `${ROOTS.DASHBOARD}/users`,
      list: `${ROOTS.DASHBOARD}/users`,
    },
    externalAdvisers: {
      root: `${ROOTS.DASHBOARD}/external-advisers`,
      list: `${ROOTS.DASHBOARD}/external-advisers`,
      create: `${ROOTS.DASHBOARD}/external-advisers/new`,
    },
    properties: {
      root: `${ROOTS.DASHBOARD}/properties`,
      list: `${ROOTS.DASHBOARD}/properties`,
      create: `${ROOTS.DASHBOARD}/properties/new`,
      edit: (id: number | string) => `${ROOTS.DASHBOARD}/properties/update/${id}`,
      details: (id: number | string) => `${ROOTS.DASHBOARD}/properties/view/${id}`,

    },
    admin: {
      internal: `${ROOTS.DASHBOARD}/admin-internal`,
      cashFlow: `${ROOTS.DASHBOARD}/cashFlow`,
      commissions: `${ROOTS.DASHBOARD}/commissions`,
      fileManager: `${ROOTS.DASHBOARD}/fileManager`,
    },
    owners: {
      root: `${ROOTS.DASHBOARD}/owners`,
      list: `${ROOTS.DASHBOARD}/owners`,
      create: `${ROOTS.DASHBOARD}/owners/new`,
    },
  },
};
