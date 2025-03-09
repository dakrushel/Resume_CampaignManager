import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import fetchMock from "jest-fetch-mock";

globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;

fetchMock.enableMocks();
