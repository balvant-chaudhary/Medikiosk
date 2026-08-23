// backend/src/middleware/validate.js
/**
 * Lightweight request body validator.
 * Takes a map of fieldName → { required, type, pattern, min, max }
 * Returns 400 with a list of validation errors on failure.
 */
export function validateBody(rules) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body[field];
      const present = value !== undefined && value !== null && value !== '';

      if (rule.required && !present) {
        errors.push({ field, message: rule.message || `${field} is required` });
        continue;
      }
      if (!present) continue; // optional field missing — skip further checks

      if (rule.type === 'email') {
        if (!/^\S+@\S+\.\S+$/.test(value)) {
          errors.push({ field, message: `${field} must be a valid email` });
        }
      }
      if (rule.type === 'phone') {
        if (!/^\d{10}$/.test(value)) {
          errors.push({ field, message: `${field} must be a 10-digit number` });
        }
      }
      if (rule.min !== undefined && String(value).length < rule.min) {
        errors.push({ field, message: `${field} must be at least ${rule.min} characters` });
      }
      if (rule.max !== undefined && String(value).length > rule.max) {
        errors.push({ field, message: `${field} must be at most ${rule.max} characters` });
      }
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push({ field, message: `${field} must be one of: ${rule.enum.join(', ')}` });
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push({ field, message: rule.patternMessage || `${field} is invalid` });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    next();
  };
}
