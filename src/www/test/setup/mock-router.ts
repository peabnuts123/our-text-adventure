import { NextRouter } from 'next/router';

// See: https://github.com/vercel/next.js/issues/7479
// Next.js requires you to mock this before testing virtually
//  any code, but doesn't seem to provide any tooling for this.
jest.mock('next/router', () => ({
  useRouter(): NextRouter {
    return {
      basePath: '',
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      isLocaleDomain: false,
      events: {
        emit: jest.fn(),
        off: jest.fn(),
        on: jest.fn(),
      },
      isFallback: false,
      isPreview: false,
      isReady: true,
      push: jest.fn(() => Promise.resolve(true)),
      replace: jest.fn(() => Promise.resolve(true)),
      reload: jest.fn(),
      prefetch: jest.fn(() => Promise.resolve()),
      back: jest.fn(),
      beforePopState: jest.fn(),
    };
  },
}));

export {}; // Workaround required because of `isolatedModules: true`. See: https://github.com/vercel/next.js/issues/7959
