import { MIN_PASSWORD_LENGTH } from "../constants/values.js";

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= MIN_PASSWORD_LENGTH;
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== "";
};

export const validateNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

export const validatePositiveNumber = (value) => {
  return validateNumber(value) && parseFloat(value) > 0;
};

export const getValidationErrors = (data, schema) => {
  const errors = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    if (rules.required && !validateRequired(value)) {
      errors[field] = `${field} обязателен`;
      continue;
    }
    
    if (rules.email && value && !validateEmail(value)) {
      errors[field] = "Некорректный email";
    }
    
    if (rules.password && value && !validatePassword(value)) {
      errors[field] = `Минимум ${MIN_PASSWORD_LENGTH} символов`;
    }
    
    if (rules.number && value && !validateNumber(value)) {
      errors[field] = "Должно быть число";
    }
    
    if (rules.positive && value && !validatePositiveNumber(value)) {
      errors[field] = "Должно быть положительное число";
    }
    
    if (rules.min && value && parseFloat(value) < rules.min) {
      errors[field] = `Минимум ${rules.min}`;
    }
    
    if (rules.max && value && parseFloat(value) > rules.max) {
      errors[field] = `Максимум ${rules.max}`;
    }
  }
  
  return errors;
};
