export const sanitizeInput = (input) => {
    if (typeof input === "string") {
      
        // Remove potentially harmful characters in a string to prevent NoSQL injection
        input = input.replace(/\./, "\u002E")
      return input.replace(/[\$]/g, "");
    } else if (typeof input === "object" && input !== null) {
      
        // Recursively sanitize each field in the object
      const sanitizedData = { ...input };
      for (const key in sanitizedData) {
        sanitizedData[key] = sanitizeInput(sanitizedData[key]);
      }
      return sanitizedData;
    }
    return input;
  };
  