import axios from "axios";

const BASE_URL = "https://www.dnd5eapi.co/api/2014/";

// Fetch all available races
export const fetchRaces = async () => {
  try {
    const response = await axios.get(`${BASE_URL}races`);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching races:", error);
    throw error;
  }
};

export const fetchRaceDetails = async (index) => {
  try {
    const response = await axios.get(`${BASE_URL}races/${index.toLowerCase()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching race details:", error);
    throw error;
  }
};

// Fetch all available classes
export const fetchClasses = async () => {
  try {
    const response = await axios.get(`${BASE_URL}classes`);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw error;
  }
};

// Fetch class details by index (e.g., "wizard")
export const fetchClassDetails = async (classIndex) => {
  try {
    const response = await axios.get(
      `${BASE_URL}classes/${classIndex.toLowerCase()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching class details:", error);
    throw error;
  }
};

// Fetch spellcasting info for a class (includes spell slots progression)
export const fetchClassSpellcasting = async (classIndex) => {
  try {
    const response = await axios.get(
      `${BASE_URL}classes/${classIndex.toLowerCase()}/spellcasting`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching class spellcasting info:", error);
    return null; // Return null if class doesn't have spellcasting
  }
};

// Fetch spells for a specific class (simplified version)
export const fetchClassSpells = async (classIndex) => {
  try {
    const response = await axios.get(
      `${BASE_URL}classes/${classIndex.toLowerCase()}/spells`
    );
    const spellList = response.data.results || [];

    // Fetch details for each spell
    const spellsWithDetails = await Promise.all(
      spellList.map(async (spell) => {
        try {
          const details = await fetchSpellDetails(spell.index);
          return {
            ...spell,
            ...details,
            level: details.level || 0,
          };
        } catch (error) {
          console.error(`Error fetching details for ${spell.index}:`, error);
          return {
            ...spell,
            level: 0,
            desc: ["Error loading spell details"],
            school: { name: "Unknown" },
          };
        }
      })
    );

    return spellsWithDetails;
  } catch (error) {
    console.error("Error fetching class spells:", error);
    if (error.response?.status === 404) {
      return []; // Return empty array for non-spellcasting classes
    }
    throw error;
  }
};

// Fetch spell details (only when needed)
export const fetchSpellDetails = async (spellIndex) => {
  try {
    const response = await axios.get(
      `${BASE_URL}spells/${spellIndex.toLowerCase()}`
    );
    return {
      name: response.data.name,
      desc: response.data.desc || [],
      level: response.data.level || 0,
      school: response.data.school?.name || "Unknown",
      components: response.data.components || [],
      material: response.data.material || "",
      ritual: response.data.ritual || false,
      concentration: response.data.concentration || false,
      casting_time: response.data.casting_time || "",
      range: response.data.range || "",
      duration: response.data.duration || "",
      higher_level: response.data.higher_level || [],
    };
  } catch (error) {
    console.error(`Error fetching spell details for ${spellIndex}:`, error);
    throw error;
  }
};

// Modified to work with local spell slot tables
export const fetchSpellSlots = async (classIndex, level) => {
  // First try local data
  const localSlots = getLocalSpellSlots(classIndex, level);
  if (Object.keys(localSlots).length > 0) {
    return localSlots;
  }

  // Fallback to API
  try {
    const response = await axios.get(
      `${BASE_URL}/classes/${classIndex.toLowerCase()}/levels/${level}`
    );
    return response.data.spellcasting?.spell_slots || {};
  } catch (error) {
    console.error("Error fetching spell slots:", error);
    return {};
  }
};

// Fetch class features (unchanged)
export const fetchClassFeatures = async (classIndex, level) => {
  try {
    const allFeatures = [];

    for (let l = 1; l <= level; l++) {
      const response = await axios.get(
        `${BASE_URL}classes/${classIndex.toLowerCase()}/levels/${l}`
      );

      if (response.data.features && response.data.features.length > 0) {
        // Fetch details for each feature
        const featuresWithDetails = await Promise.all(
          response.data.features.map(async (feature) => {
            try {
              // Only fetch details if we don't already have the description
              if (!feature.desc) {
                const details = await fetchFeatureDetails(feature.index);
                return {
                  ...feature,
                  ...details,
                  level: l,
                };
              }
              return {
                ...feature,
                level: l,
              };
            } catch (error) {
              console.error(
                `Error fetching details for ${feature.index}:`,
                error
              );
              return {
                ...feature,
                level: l,
                desc: ["Error loading feature details"],
              };
            }
          })
        );

        allFeatures.push(...featuresWithDetails);
      }
    }

    return allFeatures;
  } catch (error) {
    console.error("Error fetching class features:", error);
    return [];
  }
};

// Fetch feature details by index
export const fetchFeatureDetails = async (featureIndex) => {
  try {
    const response = await axios.get(
      `${BASE_URL}features/${featureIndex.toLowerCase()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching feature details:", error);
    throw error;
  }
};
