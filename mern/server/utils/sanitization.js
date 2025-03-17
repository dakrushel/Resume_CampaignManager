export const sanitizeInput = (input) => {
  if (typeof input === "string") {
      // Remove potentially harmful characters in a string to prevent NoSQL injection
      input = input.replace(/\./g, "\u002E");
      return input.replace(/[\$]/g, "");
  } else if (Array.isArray(input)) {
      // Preserve arrays while sanitizing each element
      return input.map(item => sanitizeInput(item));
  } else if (typeof input === "object" && input !== null) {
      // Preserve objects but sanitize their values
      const sanitizedData = { ...input };
      for (const key in sanitizedData) {
          sanitizedData[key] = sanitizeInput(sanitizedData[key]);
      }
      return sanitizedData;
  }
  return input;
};
