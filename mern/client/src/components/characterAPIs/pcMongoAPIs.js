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

// In pcMongoAPIs.js
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
  
      if (!response.ok) {
        const errorData = await response.json();
        console.log("Server response error details:", errorData);
        throw new Error(errorData.message || "Failed to create character");
      }
  
      return await response.json();
    } catch (error) {
      console.error("Error creating character:", error);
      throw error;
    }
  };

// In pcMongoAPIs.js
export const modifyCharacter = async (id, characterData, token) => {
    try {
        const response = await fetch(`http://localhost:5050/characters/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(characterData),
          });
          
  
      if (response.status !== 200) {
        const errorData = await response.json(); // Read server response
        console.error("Server validation failed:", errorData); // Log details
        console.log("Sent payload:", characterData); // Log payload
        throw new Error(`Validation failed: ${errorData.message}`);
      }      
  
      return response.data;
    } catch (error) {
      let errorMessage = 'Failed to update character';
      
      if (error.response) {
        // Server responded with error status
        const { data, status } = error.response;
        
        if (response.status !== 200) {
            const errorData = await response.json(); // Read server response
            console.error("Server validation failed:", errorData); // Log details
            console.log("Sent payload:", characterData); // Log payload
            throw new Error(`Validation failed: ${errorData.message}`);
        }        

        if (status === 400) {
          errorMessage = data.message || 'Validation failed';
          console.error('Validation errors:', {
            errors: data.errors,
            payload: characterData
          });
        } else if (status === 401) {
          errorMessage = 'Unauthorized - Please log in again';
        } else if (status === 404) {
          errorMessage = 'Character not found';
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server';
      } else {
        // Something else happened
        errorMessage = error.message || 'Unknown error occurred';
      }
  
      throw new Error(errorMessage);
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
