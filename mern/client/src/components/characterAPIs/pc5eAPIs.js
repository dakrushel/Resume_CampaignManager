import axios from "axios";

const BASE_URL = "https://www.dnd5eapi.co/api";

// Fetch all available races
export const fetchRaces = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/races`);
        return response.data.results;
    } catch (error) {
        console.error("Error fetching races:", error);
        throw error;
    }
};

export const fetchRaceDetails = async (index) => {
    try {
        const response = await axios.get(`${BASE_URL}/races/${index.toLowerCase()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching race details:", error);
        throw error;
    }
};

// Fetch all available classes
export const fetchClasses = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/classes`);
        return response.data.results;
    } catch (error) {
        console.error("Error fetching classes:", error);
        throw error;
    }
};

// Fetch class details by index (e.g., "wizard")
export const fetchClassDetails = async (classIndex) => {
    try {
        const response = await axios.get(`${BASE_URL}/classes/${classIndex.toLowerCase()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching class details:", error);
        throw error;
    }
};

// Fetch spells for a specific class
export const fetchClassSpells = async (classIndex) => {
    try {
        const response = await axios.get(`${BASE_URL}/classes/${classIndex.toLowerCase()}/spells`);
        return response.data.results;
    } catch (error) {
        console.error("Error fetching spells for class:", error);
        throw error;
    }
};

export const fetchClassFeatures = async (classIndex, level) => {
    try {
      // First get all features up to the current level
      const allFeatures = [];
      
      // Fetch features for each level from 1 to specified level
      for (let l = 1; l <= level; l++) {
        const response = await axios.get(
          `${BASE_URL}/classes/${classIndex.toLowerCase()}/levels/${l}`
        );
        
        if (response.data.features && response.data.features.length > 0) {
          // Enhance each feature with its level
          const featuresWithLevel = response.data.features.map(feature => ({
            ...feature,
            level: l // Add level information to each feature
          }));
          allFeatures.push(...featuresWithLevel);
        }
      }
      
      return allFeatures;
    } catch (error) {
      console.error("Error fetching class features:", error);
      return []; // Return empty array instead of throwing error
    }
  };
