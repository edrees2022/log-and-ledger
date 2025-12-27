import { useMutation } from '@tanstack/react-query';
import { classifyTransaction, classifyTransactionsBatch, type AIClassificationInput } from '../lib/ai';

export type TxnClassifyInput = AIClassificationInput & {
  // Allow callers to pass extra client-only hints; we'll ignore them
  direction?: 'in' | 'out';
};

export function useClassifyTransaction() {
  return useMutation({
    mutationKey: ['ai', 'classify-transaction'],
  mutationFn: (input: TxnClassifyInput) => classifyTransaction(input),
  });
}

export function useBatchClassification() {
  return useMutation({
    mutationKey: ['ai', 'classify-transaction', 'batch'],
    mutationFn: (items: TxnClassifyInput[]) => classifyTransactionsBatch(items),
  });
}
