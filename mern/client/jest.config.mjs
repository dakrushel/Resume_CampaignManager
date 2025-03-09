export default {
    testEnvironment: "jest-environment-jsdom",
    setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
    moduleFileExtensions: ["js", "jsx", "mjs"],
    transform: {
      "^.+\\.[jt]sx?$": "babel-jest",  // Transpile .js and .jsx files
      "^.+\\.mjs$": "babel-jest",  // Explicitly transform .mjs files
    },
  };
  