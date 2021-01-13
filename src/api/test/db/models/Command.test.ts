import { v4 as uuid } from 'uuid';

import Command from "@app/db/models/Command";

describe('Command model', () => {
  ((/* Tests for `Command.isEquivalentTo()` */) => {
    const testCases = [
      // Positive test cases
      { description: "An identical (single-word) string matches", input: 'test', command: 'test', result: true },
      { description: "A differently-cased string matches", input: 'tEsT', command: 'test', result: true },
      { description: "An identical (multi-world) string matches", input: 'hello world', command: 'hello world', result: true },
      { description: "A differently-spaced string matches (spaced input)", input: '    hello    world     ', command: 'hello world', result: true },
      { description: "A differently-spaced string matches (spaced reference)", input: 'hello world', command: '    hello    world     ', result: true },
      { description: "A ligature matches with its normalised equivalent", input: 'ffully equivalent', command: 'ﬀully equivalent', result: true },
      { description: "A unicode string matches its normalised equivalent", input: '𝓻𝓪𝓶𝓫𝓸𝓽𝓪𝓷', command: 'rambotan', result: true },
      { description: "A complex scenario", input: 'Ⓐ       ⓑⒾⓖ ⓈⓟⒾ①Ⓓéⓡ Ⓘⓝ ⓉⓗⒺ                       ⓌöⓄⓓⓈ', command: 'a big     Spi1dér iN      tHe     wöoDs      ', result: true },

      // Negative test cases
      { description: 'A space in the middle of a word does not match', input: 'h   e   l  ll o world', command: 'hello world', result: false },
      { description: 'Unique accented letters are not treated as equivalent', input: 'héllo world', command: 'hello world', result: false },
      // { description: 'template', input: 'template', command: 'template', result: false },
    ];

    testCases.forEach((testCase) => {
      it(`isEquivalentTo() - ${testCase.description}`, () => {
        // Setup
        const mockCommand = new Command({
          id: uuid(),
          command: testCase.command,
          itemsTaken: [],
          itemsGiven: [],
          itemsRequired: [],
          targetScreenId: uuid(), // This might break as it is not a valid reference
        });

        // Test
        const result = mockCommand.isEquivalentTo(testCase.input);

        // Assert
        expect(result).toBe(testCase.result);
      });
    });
  })();
});

