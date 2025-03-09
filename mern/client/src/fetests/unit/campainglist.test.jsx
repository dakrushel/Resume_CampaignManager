import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import "@testing-library/jest-dom";
import CampaignList from "../../components/campaignlist.jsx";
import fetchMock from "jest-fetch-mock";

// Enable fetch mocking before each test
beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponse(JSON.stringify([])); // Default response
});

jest.mock("@auth0/auth0-react", () => ({
    useAuth0: () => ({
        getAccessTokenSilently: jest.fn(() => Promise.resolve("mock-token")),
    }),
}));

describe("CampaignList Component", () => {
    test("renders loading state", () => {
        render(
            <MemoryRouter>
                <CampaignList />
            </MemoryRouter>
        );
        expect(screen.getByText(/Loading campaigns/i)).toBeInTheDocument();
    });

    test("displays campaigns after fetch", async () => {
        fetchMock.mockResponseOnce(JSON.stringify([
            { _id: "1", title: "Campaign A" },
            { _id: "2", title: "Campaign B" }
        ]));

        render(
            <MemoryRouter>
                <CampaignList />
            </MemoryRouter>
        );

        // ✅ Use `waitFor` instead of `act()`
        await waitFor(() => expect(screen.getByText("Campaign A")).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText("Campaign B")).toBeInTheDocument());
    });

    test("renders message when no campaigns exist", async () => {
        fetchMock.mockResponseOnce(JSON.stringify([]));

        render(
            <MemoryRouter>
                <CampaignList />
            </MemoryRouter>
        );

        // ✅ Use `waitFor` to ensure component updates
        await waitFor(() => expect(screen.getByText(/No campaigns available/i)).toBeInTheDocument());
    });
});
