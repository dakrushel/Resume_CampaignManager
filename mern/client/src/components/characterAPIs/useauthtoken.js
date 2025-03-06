import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";

export const useAuthToken = () => {
    const { getAccessTokenSilently } = useAuth0();
    const [token, setToken] = useState(null);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const accessToken = await getAccessTokenSilently();
                setToken(accessToken);
            } catch (error) {
                console.error("Error fetching Auth0 token:", error);
            }
        };
        fetchToken();
    }, [getAccessTokenSilently]);

    return token;
};
