/**
 * Convert an arbitrarily-indented heredoc string into a string array.
 * Indentation will be detected and removed.
 * Be careful that you start your heredoc on a new line, otherwise indentation
 * will be detected as 0.
 * @param heredoc String to convert
 */
export default function heredocToStringArray(heredoc: string): string[] {
  const lines = heredoc
    // Remove any newlines and space at the end
    .trimRight()
    // Remove the first blank line
    .replace(/^\s*[\r\n]+/, '')
    // Split string into lines
    .split(/[\r\n]/g);

  // Detect indentation size based on first line
  // @NOTE ALL WHITESPACE CHARACTERS ONLY COUNT AS 1
  const indentSize = /^\s*/.exec(lines[0])![0].length;

  // Trim string up to indentation point for each line, and trim any trailing white space
  return lines.map((line) => line.substring(indentSize).trimRight());
}
