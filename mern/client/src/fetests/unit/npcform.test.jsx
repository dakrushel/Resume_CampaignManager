// import React from "react";
// import { jest, describe, test, expect } from "@jest/globals";
// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import NPCForm from "../../components/npcform";
// import { Auth0Provider } from "@auth0/auth0-react";

// // Mocking Auth0 hook
// jest.mock("@auth0/auth0-react", () => ({
//     useAuth0: () => ({
//         getAccessTokenSilently: jest.fn(() => Promise.resolve("mock-token")),
//     }),
// }));

// // Mock `randGen` function to return consistent test data
// jest.mock("../utils/RandomGeneration/characterGenerator.mjs", () => ({
//     randGen: jest.fn(() => ({
//         charName: "Test Character",
//         age: 30,
//         race: "Elf",
//         gender: "Male",
//         alignment: "Lawful Good",
//         className: "Wizard",
//         level: 5,
//         size: "Medium",
//         speed: 30,
//         stats: {
//             strength: 10,
//             dexterity: 14,
//             constitution: 12,
//             intelligence: 18,
//             wisdom: 16,
//             charisma: 8,
//         },
//     })),
// }));

// describe("NPCForm Component", () => {
//     const mockOnSave = jest.fn();
//     const mockOnCancel = jest.fn();

//     const mockNPC = {
//         charName: "Test NPC",
//         age: 25,
//         race: "Elf",
//         gender: "Male",
//         alignment: "Chaotic Good",
//         className: "Wizard",
//         level: 3,
//         size: "Medium",
//         speed: 30,
//         quirks: "Loves shiny objects",
//         features: "Has glowing eyes",
//         vices: "Greedy",
//         virtues: "Brave",
//         ideals: "Freedom above all",
//         stats: {
//             strength: 12,
//             dexterity: 14,
//             constitution: 13,
//             intelligence: 16,
//             wisdom: 11,
//             charisma: 10,
//         },
//     };

//     test("renders NPCForm with default values", () => {
//         render(
//             <Auth0Provider>
//                 <NPCForm campaignID="1" locationID="1" onSave={mockOnSave} onCancel={mockOnCancel} />
//             </Auth0Provider>
//         );

//         expect(screen.getByLabelText(/Name:/i)).toBeInTheDocument();
//         expect(screen.getByLabelText(/Race:/i)).toBeInTheDocument();
//         expect(screen.getByLabelText(/Alignment:/i)).toBeInTheDocument();
//         expect(screen.getByText(/Save/i)).toBeInTheDocument();
//         expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
//     });

//     test("updates input fields on user entry", () => {
//         render(
//             <Auth0Provider>
//                 <NPCForm campaignID="1" locationID="1" onSave={mockOnSave} onCancel={mockOnCancel} />
//             </Auth0Provider>
//         );

//         const nameInput = screen.getByLabelText(/Name:/i);
//         fireEvent.change(nameInput, { target: { value: "New NPC" } });
//         expect(nameInput.value).toBe("New NPC");

//         const raceInput = screen.getByLabelText(/Race:/i);
//         fireEvent.change(raceInput, { target: { value: "Orc" } });
//         expect(raceInput.value).toBe("Orc");
//     });

//     test("calls onSave when form is submitted", async () => {
//         render(
//             <Auth0Provider>
//                 <NPCForm
//                     campaignID="1"
//                     locationID="1"
//                     existingNPC={mockNPC}
//                     onSave={mockOnSave}
//                     onCancel={mockOnCancel}
//                 />
//             </Auth0Provider>
//         );

//         fireEvent.click(screen.getByText(/Save/i));

//         await waitFor(() => {
//             expect(mockOnSave).toHaveBeenCalled();
//         });
//     });

//     test("calls onCancel when cancel button is clicked", () => {
//         render(
//             <Auth0Provider>
//                 <NPCForm
//                     campaignID="1"
//                     locationID="1"
//                     existingNPC={mockNPC}
//                     onSave={mockOnSave}
//                     onCancel={mockOnCancel}
//                 />
//             </Auth0Provider>
//         );

//         fireEvent.click(screen.getByText(/Cancel/i));
//         expect(mockOnCancel).toHaveBeenCalled();
//     });
// });
