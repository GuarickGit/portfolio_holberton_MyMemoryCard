import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Ajoute les matchers de jest-dom à Vitest
expect.extend(matchers);

// Nettoie après chaque test
afterEach(() => {
  cleanup();
});
