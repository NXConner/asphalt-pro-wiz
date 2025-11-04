import { useState, useCallback } from 'react';
import { z } from 'zod';

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: z.ZodType<T>;
  onSubmit: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface FieldError {
  [key: string]: string | undefined;
}

/**
 * Custom form hook with validation, state management, and error handling
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback(
    (name: keyof T, value: any): string | undefined => {
      if (!validationSchema) return undefined;

      try {
        // Validate the entire form with the updated field value
        const testData = { ...values, [name]: value };
        validationSchema.parse(testData);
        return undefined;
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Find error for this specific field
          const fieldError = error.errors.find(err => 
            err.path.length > 0 && err.path[0] === name
          );
          return fieldError?.message;
        }
        return undefined;
      }
    },
    [validationSchema, values]
  );

  const validateForm = useCallback(
    async (vals: T = values): Promise<boolean> => {
      if (!validationSchema) return true;

      setIsValidating(true);
      try {
        await validationSchema.parseAsync(vals);
        setErrors({});
        setIsValidating(false);
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const newErrors: FieldError = {};
          error.errors.forEach((err) => {
            const path = err.path.join('.');
            newErrors[path] = err.message;
          });
          setErrors(newErrors);
        }
        setIsValidating(false);
        return false;
      }
    },
    [validationSchema, values]
  );

  const handleChange = useCallback(
    (name: keyof T) => (value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      if (validateOnChange) {
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name as string]: error }));
      }
    },
    [validateOnChange, validateField]
  );

  const handleBlur = useCallback(
    (name: keyof T) => () => {
      setTouched((prev) => ({ ...prev, [name as string]: true }));

      if (validateOnBlur) {
        const error = validateField(name, values[name]);
        setErrors((prev) => ({ ...prev, [name as string]: error }));
      }
    },
    [validateOnBlur, validateField, values]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched(allTouched);

      // Validate form
      const isValid = await validateForm();
      if (!isValid) return;

      // Submit form
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit]
  );

  const reset = useCallback((newValues?: Partial<T>) => {
    setValues(newValues ? { ...initialValues, ...newValues } : initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [name as string]: error }));
  }, []);

  const getFieldProps = useCallback(
    (name: keyof T) => ({
      value: values[name],
      onChange: (e: any) => {
        const value = e?.target ? e.target.value : e;
        handleChange(name)(value);
      },
      onBlur: handleBlur(name),
      error: touched[name as string] ? errors[name as string] : undefined,
    }),
    [values, errors, touched, handleChange, handleBlur]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValidating,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
    validateForm,
    getFieldProps,
  };
}
