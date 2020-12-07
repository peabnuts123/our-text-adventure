/**
 * Convenience function to implement generic type-guards.
 * Wrap a boolean test in this function to make TypeScript infer
 * types better, based on any logical expression.
 *
 * @param object Object to test
 * @param test Test result, whether the object is of type T
 */
export default function typeCheck<T>(object: unknown, test: boolean): object is T {
  return test;
}
