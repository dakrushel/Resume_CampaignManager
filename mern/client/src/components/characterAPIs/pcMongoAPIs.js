// Helper function for API requests
const makeRequest = async (url, method, token, body = null) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const config = {
    method,
    headers,
  };

  // Only add body if it exists
  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = {
          message: `Request failed with status ${response.status}`,
        };
      }
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${url}`, error);
    throw error;
  }
};

// Fetch all characters
export const fetchAllCharacters = async (token) => {
  if (!token) throw new Error("Authentication token is required");
  return makeRequest("http://localhost:5050/characters", "GET", token);
};

// Fetch character by ID
export const fetchCharacterById = async (id, token) => {
  if (!id) throw new Error("Character ID is required");
  if (!token) throw new Error("Authentication token is required");
  return makeRequest(`http://localhost:5050/characters/${id}`, "GET", token);
};

// Fetch characters by campaign
export const fetchCharactersByCampaign = async (campaignID, token) => {
  if (!campaignID) throw new Error("Campaign ID is required");
  if (!token) throw new Error("Authentication token is required");

  try {
    return await makeRequest(
      `http://localhost:5050/characters/campaign/${campaignID}`,
      "GET",
      token
    );
  } catch (error) {
    if (error.message.includes("404")) {
      console.warn(`No characters found for campaign ${campaignID}`);
      return [];
    }
    throw error;
  }
};

// Create new character
export const createCharacter = async (characterData, token) => {
  if (!token) throw new Error("Authentication token is required");

  // Enhanced validation
  const requiredFields = {
    name: "string",
    race: "string",
    class: "string",
    level: "number",
    campaignID: "string",
  };

  const validationErrors = [];

  // Check required fields
  for (const [field, type] of Object.entries(requiredFields)) {
    const value = characterData[field];

    if (value === undefined || value === null) {
      validationErrors.push(`Missing required field: ${field}`);
    } else if (typeof value !== type) {
      validationErrors.push(
        `Invalid type for ${field}: expected ${type}, got ${typeof value}`
      );
    }
  }

  if (validationErrors.length > 0) {
    throw new Error(
      `Frontend validation errors:\n${validationErrors.join("\n")}`
    );
  }

  // Prepare clean data
  const cleanData = {
    ...characterData,
    name: characterData.name.trim(),
    alignment: characterData.alignment || "Unaligned",
    level: parseInt(characterData.level) || 1,
    speed: parseInt(characterData.speed) || 30,
    stats: {
      strength: parseInt(characterData.stats?.strength) || 10,
      dexterity: parseInt(characterData.stats?.dexterity) || 10,
      constitution: parseInt(characterData.stats?.constitution) || 10,
      intelligence: parseInt(characterData.stats?.intelligence) || 10,
      wisdom: parseInt(characterData.stats?.wisdom) || 10,
      charisma: parseInt(characterData.stats?.charisma) || 10,
    },
    proficiencies: characterData.proficiencies || [],
    languages: characterData.languages || [],
    traits: characterData.traits || [],
    startingProficiencies: characterData.startingProficiencies || [],
    classProficiencies: characterData.classProficiencies || [],
    classFeatures: characterData.classFeatures || [],
    selectedSpells: characterData.selectedSpells || [],
    spellSlots: characterData.spellSlots || {},
    usedSlots: characterData.usedSlots || {},
  };

  console.log("Final character data for API:", cleanData);

  try {
    const response = await fetch("http://localhost:5050/characters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cleanData),
    });

    if (!response.ok) {
      // Try to get detailed error from backend
      let errorDetails = {};
      try {
        errorDetails = await response.json();
        console.error("Backend validation errors:", errorDetails);
      } catch (e) {
        console.error("Failed to parse error response:", e);
      }

      // Create a more helpful error message
      const errorMessage = errorDetails.error
        ? `Backend error: ${errorDetails.error}`
        : errorDetails.message
        ? errorDetails.message
        : `HTTP error! status: ${response.status}`;

      if (errorDetails.details) {
        console.error("Validation details:", errorDetails.details);
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("API call failed:", {
      endpoint: "/characters",
      method: "POST",
      payload: cleanData,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

// Update existing character
// In pcMongoAPIs.js
export const modifyCharacter = async (id, characterData, token) => {
  if (!id) throw new Error("Character ID is required");
  if (!token) throw new Error("Authentication token is required");

  try {
    const response = await fetch(`http://localhost:5050/characters/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(characterData),
    });

    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.json();
        console.error("Backend validation errors:", errorDetails);
      } catch (e) {
        console.error("Failed to parse error response:", e);
      }

      throw new Error(
        errorDetails?.message ||
          errorDetails?.error ||
          `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", {
      endpoint: `PUT /characters/${id}`,
      payload: characterData,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

// Delete character
export const removeCharacter = async (id, token) => {
  if (!id) throw new Error("Character ID is required");
  if (!token) {
    console.error("No token provided for delete operation");
    throw new Error("Authentication token is required");
  }

  try {
    console.log(
      "Making DELETE request to:",
      `http://localhost:5050/characters/${id}`
    );
    const response = await fetch(`http://localhost:5050/characters/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Delete response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Delete failed with:", errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Full delete error:", {
      id,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};
