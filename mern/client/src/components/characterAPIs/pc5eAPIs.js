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
        const response = await axios.get(`${BASE_URL}/races/${index}`);
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
        const response = await axios.get(`${BASE_URL}/classes/${classIndex}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching class details:", error);
        throw error;
    }
};

// Fetch spells for a specific class
export const fetchClassSpells = async (classIndex) => {
    try {
        const response = await axios.get(`${BASE_URL}/classes/${classIndex}/spells`);
        return response.data.results;
    } catch (error) {
        console.error("Error fetching spells for class:", error);
        throw error;
    }
};

// Fetch class features by level
export const fetchClassFeatures = async (classIndex, level) => {
    try {
        const response = await axios.get(`${BASE_URL}/classes/${classIndex}/levels/${level}`);
        return response.data.features;
    } catch (error) {
        console.error("Error fetching class features:", error);
        throw error;
    }
};
