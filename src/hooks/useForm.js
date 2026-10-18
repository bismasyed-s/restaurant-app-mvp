import { useCallback, useMemo, useState } from 'react';

export default function useForm(initialValues, validate) {
  // This state holds the current values in the form fields.
  const [values, setValues] = useState(initialValues);
  // This state holds validation messages next to their fields.
  const [errors, setErrors] = useState({});

  // This function updates a field and clears its old error while the user edits.
  const handleChange = useCallback((field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  // This function validates the fields before it calls the screen's submit action.
  const handleSubmit = useCallback((onValid) => async () => {
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) return onValid(values);
    return undefined;
  }, [validate, values]);

  // This function restores the starting values and clears old messages.
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  // This value tells the screen whether the current fields pass validation.
  const isValid = useMemo(() => Object.keys(validate(values)).length === 0, [validate, values]);

  return { values, errors, handleChange, handleSubmit, reset, isValid };
}
