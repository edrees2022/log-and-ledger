import { describe, it, expect } from 'vitest';
import { normalize, sanitizeUpdate } from '../utils/sanitize';

describe('normalize', () => {
  it('drops null and empty strings but keeps 0/false', () => {
    const input = {
      a: null,
      b: '',
      c: 0,
      d: false,
      e: 'text',
    };
    const out = normalize(input);
    expect(out).toEqual({ c: 0, d: false, e: 'text' });
  });

  it('recurses into nested objects and preserves arrays', () => {
    const input = {
      obj: { x: '', y: null, z: 1 },
      arr: [null, '', 1, { k: '' }, ['']],
    } as any;
    const out = normalize(input);
    // arrays are preserved as-is
    expect(out.arr).toEqual([null, '', 1, { k: '' }, ['']]);
    // nested object fields normalized
    expect(out.obj).toEqual({ z: 1 });
  });
});

describe('sanitizeUpdate', () => {
  it('strips default sensitive keys and normalizes payload', () => {
    const input = {
      id: 'abc',
      company_id: 'co1',
      created_by: 'user1',
      name: 'Item',
      note: '',
      extra: null,
    };
    const out = sanitizeUpdate(input);
    expect(out).toEqual({ name: 'Item' });
  });

  it('coerces numericKeys numbers to strings and leaves strings intact', () => {
    const input = {
      amount: 12.34,
      rate: '5',
      qty: 0,
    } as any;
    const out = sanitizeUpdate(input, ['company_id', 'created_by', 'id'], ['amount', 'qty', 'rate']);
    expect(out.amount).toBe('12.34');
    expect(out.qty).toBe('0');
    expect(out.rate).toBe('5'); // was already string
  });

  it('does not touch non-listed numeric fields', () => {
    const input = { value: 10 } as any;
    const out = sanitizeUpdate(input, undefined as any, ['amount']);
    expect(out.value).toBe(10);
  });
});
