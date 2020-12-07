/**
 * Test whether an object is an array of items, all of which are of type T
 *
 * @param array Object to test
 * @param testFunc Function to determine whether an array item is of type T
 */
export default function isArray<T>(array: unknown, testFunc: (val: unknown) => boolean): array is T[] {
    if (!Array.isArray(array)) {
      return false;
    } else {
      return array.every(testFunc);
    }
}
