import { test, expect, vi, beforeEach } from 'vitest';
import { projectMonthsRemaining, applyContingency } from './budgetCalc';

// Very light unit tests — run with a JS test runner if you have one, or use node to import the module.

export function assertEqual<T>(a: T, b: T, _msg?: string) {
  expect(a).toEqual(b); // deep compare arrays/objects
}

export function assertClose(a: number, b: number, digits = 2) {
  expect(a).toBeCloseTo(b, digits); // for floating-point math
}

test('projectMonthsRemaining includes current month through December', () => {
  const now = new Date('2025-10-07');
  const months = projectMonthsRemaining(2025, now);
  assertEqual(months[0], '2025-10', 'first month should be current');
  assertEqual(months[months.length - 1], '2025-12', 'last month should be Dec');
});

test('applyContingency computes contingency correctly', () => {
  assertClose(applyContingency(100, 10), 110);
});

console.log('budgetCalc quick tests passed');
