import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { validate, safeValidate } from '../../src/utils/validation';

describe('Validation Utilities', () => {
  describe('validate', () => {
    it('should return validated data when valid', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const data = { name: 'Test', age: 25 };
      const result = validate(schema, data);

      expect(result).toEqual(data);
    });

    it('should throw error when invalid', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const data = { name: 'Test', age: 'invalid' };

      expect(() => validate(schema, data)).toThrow();
    });

    it('should use custom error message', () => {
      const schema = z.object({
        name: z.string(),
      });

      const data = { name: 123 };

      expect(() => validate(schema, data, 'Custom error')).toThrow(
        'Custom error',
      );
    });
  });

  describe('safeValidate', () => {
    it('should return success result when valid', () => {
      const schema = z.object({
        name: z.string(),
      });

      const data = { name: 'Test' };
      const result = safeValidate(schema, data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('should return error result when invalid', () => {
      const schema = z.object({
        name: z.string(),
      });

      const data = { name: 123 };
      const result = safeValidate(schema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });
});
