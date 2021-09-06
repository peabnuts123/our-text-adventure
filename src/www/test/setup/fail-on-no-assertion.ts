/**
 * Ensure that every test has at least 1 assertion
 */
afterEach(() => {
  expect.hasAssertions();
});

export {}; // Workaround required because of `isolatedModules: true`. See: https://github.com/vercel/next.js/issues/7959
