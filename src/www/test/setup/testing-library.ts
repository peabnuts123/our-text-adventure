import "@testing-library/jest-dom";

/* What is this file?
  Seems like a pretty undocumented requirement on Testing Library's part.
  This is basically populating a bunch of Testing Library's APIs so that you can
  call things like `toHaveTextContent()` etc on `expect()`.
  Importing this package must set up some hacks in behind-the-scenes to overload
  jest's `expect()` function result to include more assertions.

  Alternatively, you can just "make sure" that you have this import in each
  test file (but your compiler or linter won't complain if you don't, even though
  it won't work).
 */
