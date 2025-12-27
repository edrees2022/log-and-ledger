import { describe, it, expect } from 'vitest';
import { classifyTransaction, textSimilarity } from '../utils/ai';

describe('AI utils - textSimilarity', () => {
  it('computes higher similarity for related words', () => {
    const a = 'Coffee at local cafe';
    const b = 'Cafe coffee and snacks';
    const c = 'Annual hosting on AWS';
    expect(textSimilarity(a, b)).toBeGreaterThan(textSimilarity(a, c));
  });
});

describe('AI utils - classifyTransaction', () => {
  it('classifies restaurant as Meals & Entertainment', () => {
    const res = classifyTransaction({ description: 'Dinner at Italian restaurant', amount: -45.32 });
    expect(res.category).toBe('Meals & Entertainment');
    expect(res.confidence).toBeGreaterThan(0.3);
  });

  it('classifies AWS as Software', () => {
    const res = classifyTransaction({ description: 'AWS monthly invoice', amount: -120.00 });
    expect(res.category).toBe('Software');
  });

  it('nudges positive amounts toward Income/Sales', () => {
    const res = classifyTransaction({ description: 'Stripe payout', amount: 2500 });
    expect(res.category).toBe('Income/Sales');
  });
});
