/**
 * setup.js
 * Global test setup run before each test file.
 * - Imports jest-dom so every test file can use matchers like
 *   toBeInTheDocument, toHaveClass, toBeDisabled, etc.
 * - Stubs window.scrollTo to avoid "not implemented" jsdom errors
 *   caused by Pagination's smooth scroll on page change.
 */
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// jsdom does not implement window.scrollTo — stub it silently
Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true })
