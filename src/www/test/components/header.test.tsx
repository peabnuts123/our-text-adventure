import { render } from '@testing-library/react';
import Header from '@app/components/header';

describe("Header component", () => {

  // Simple demonstrative test
  test("Has correct nav items", () => {
    // Setup
    const headerItems = ['Start new game', 'Home', 'About'];

    // Test
    const { container } = render(<Header />);

    // Assert
    container.querySelectorAll('.header-desktop__nav-item').forEach((link, index) => {
      expect(link).toHaveTextContent(headerItems[index]);
    });
    container.querySelectorAll('.header-mobile__nav-item').forEach((link, index) => {
      expect(link).toHaveTextContent(headerItems[index]);
    });
  });
});
