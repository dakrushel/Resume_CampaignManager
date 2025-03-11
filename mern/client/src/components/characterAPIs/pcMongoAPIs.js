export const fetchAllCharacters = async (token) => {
    try {
        const response = await fetch("http://localhost:5050/characters", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error("Failed to fetch characters");
        return await response.json();
    } catch (error) {
        console.error("Error fetching all characters:", error);
        throw error;
    }
};

export const fetchCharacterById = async (id, token) => {
    try {
        if (!id) throw new Error("Character ID is required");
        const response = await fetch(`http://localhost:5050/characters/${id}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error("Failed to fetch character");
        return await response.json();
    } catch (error) {
        console.error("Error fetching character by ID:", error);
        throw error;
    }
};

export const fetchCharactersByCampaign = async (campaignID, token) => {
    try {
        if (!campaignID) throw new Error("Campaign ID is required");
        const response = await fetch(`http://localhost:5050/characters/campaign/${campaignID}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.status === 404) {
            console.warn(`No characters found for campaign ${campaignID}`);
            return [];
        }

        if (!response.ok) throw new Error("Failed to fetch characters by campaign");
        return await response.json();
    } catch (error) {
        console.error("Error fetching characters by campaign:", error);
        throw error;
    }
};

export const createCharacter = async (characterData, token) => {
    try {
        const response = await fetch("http://localhost:5050/characters", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(characterData),
        });
        if (!response.ok) throw new Error("Failed to create character");
        return await response.json();
    } catch (error) {
        console.error("Error adding new character:", error);
        throw error;
    }
};

export const modifyCharacter = async (id, characterData, token) => {
    try {
        console.log("Sending update request for character ID:", id);
        console.log("Original Request Data:", characterData);
        
        if (!id) throw new Error("Character ID is required for update");
        if (!token) throw new Error("Missing authentication token");

        // Remove `_id` before sending to MongoDB
        // const { _id, ...characterUpdate } = characterData;
        const characterUpdate = { ...characterData };
        delete characterUpdate._id;
        
        console.log("Sanitized Request Data:", characterUpdate);

        const response = await fetch(`http://localhost:5050/characters/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(characterUpdate),
        });

        if (!response.ok) {
            const errorMsg = await response.text(); // Get backend error message
            throw new Error(`Failed to update character: ${errorMsg}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating character:", error);
        throw error;
    }
};


export const removeCharacter = async (id, token) => {
    try {
        if (!id) throw new Error("Character ID is required for deletion");
        const response = await fetch(`http://localhost:5050/characters/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error("Failed to delete character");
        return await response.json();
    } catch (error) {
        console.error("Error deleting character:", error);
        throw error;
    }
};
