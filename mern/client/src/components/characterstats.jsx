/*=============================================
*   Title: Player Character Stats Logic (Heavy)
*   Author: Grimm_mmirG
*   Date: 2025-26-02
===============================================*/

import { useState, useEffect } from "react";
// import axios from "axios";
import SpellSlotTracker from "./spellslottracker";
import SpellModal from "./spellmodal";
// import { wizardSpellSlots } from "./spelldata";
import PropTypes from "prop-types";
import { useAuthToken } from "./characterAPIs/useauthtoken";
import {
  fetchRaces,
  fetchRaceDetails,
  fetchClasses,
  fetchClassDetails,
  fetchClassFeatures,
  fetchClassSpells,
} from "./characterAPIs/pc5eAPIs";
import {
  createCharacter,
  modifyCharacter,
  removeCharacter,
} from "./characterAPIs/pcMongoAPIs";

{
  /* CharacterStats use states, spells included */
}
const CharacterStats = ({
  onClassSelect,
  characterLevel,
  onLevelChange,
  displayedCharacter,
  isNew,
  onCancel,
  refreshCharacters,
}) => {
  const [races, setRaces] = useState([]);
  const [classes, setClasses] = useState([]);
  // const [ characterLevel, setCharacterLevel] = useState(1);
  // const [setSelectedRace] = useState(null);
  // const [selectedClass, setSelectedClass] = useState(null);
  const [spellSlots, setSpellSlots] = useState({});
  const [isSpellModalOpen, setIsSpellModalOpen] = useState(false);
  const [selectedSpellLevel, setSelectedSpellLevel] = useState(null);
  const [spellsByLevel, setSpellsByLevel] = useState({});
  const [selectedSpells, setSelectedSpells] = useState([]);
  const [selectedSpellForDescription, setSelectedSpellForDescription] =
    useState(null); // Track selected spell for description
  const [initialCharacter, setInitialCharacter] = useState({});
  const [saving, setSaving] = useState(false); // Prevent duplicate submissions
  const token = useAuthToken();
  // const [setError] = useState(null);

  {
    /* Base Stats for character */
  }
  // const [baseStats, setBaseStats] = useState({
  //   strength: 10,
  //   dexterity: 10,
  //   constitution: 10,
  //   intelligence: 10,
  //   wisdom: 10,
  //   charisma: 10,
  // });

  const [character, setCharacter] = useState({
    name: "",
    alignment: "",
    race: "",
    class: "",
    speed: 0,
    hitDice: "",
    proficiencies: [],
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    size: "",
    size_description: "",
    languages: [],
    language_desc: "",
    traits: [],
    startingProficiencies: [],
    classProficiencies: [],
    level: 1, // Default level
    classFeatures: [],
    spellSlots: {},
    selectedSpells: [],
  });

  useEffect(() => {
    if (displayedCharacter && Object.keys(displayedCharacter).length > 0) {
      // Update the character state
      setCharacter((prev) => ({
        ...prev,
        ...displayedCharacter, // Merge new values
      }));

      // Set the initial character state
      setInitialCharacter(displayedCharacter);
    }
  }, [displayedCharacter]);

  const [showRaceDetails, setShowRaceDetails] = useState(false);
  const [showClassProficiencies, setShowClassProficiencies] = useState(false);
  const [showClassFeatures, setShowClassFeatures] = useState(false);

  useEffect(() => {
    const loadRaces = async () => {
      try {
        const raceData = await fetchRaces();
        setRaces(raceData);
      } catch (err) {
        console.error("Error fetching races:", err);
      }
    };
    loadRaces();
  }, []);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const classData = await fetchClasses();
        setClasses(classData);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    loadClasses();
  }, []);

  useEffect(() => {
    const fetchSpells = async () => {
      if (!character.class) return;

      try {
        const spells = await fetchClassSpells(character.class);
        const groupedSpells = spells.reduce((acc, spell) => {
          acc[spell.level] = acc[spell.level] || [];
          acc[spell.level].push(spell);
          return acc;
        }, {});
        setSpellsByLevel(groupedSpells);
      } catch (error) {
        console.error("Error fetching spells:", error);
      }
    };

    fetchSpells();
  }, [character.class]); // Only re-run when class changes

  useEffect(() => {
    const updateSpellSlots = async () => {
      if (!character.class) return;

      try {
        const spellSlotData = await fetchClassDetails(character.class);
        const levelSlots = spellSlotData.spellcasting?.spell_slots || {};
        setSpellSlots(levelSlots[character.level] || {});
      } catch (error) {
        console.error("Error fetching spell slots:", error);
      }
    };
    updateSpellSlots();
  }, [character.class, character.level]);

  const handleRaceChange = async (raceIndex) => {
    if (!raceIndex) {
      setCharacter((prev) => ({ ...prev, race: "" }));
      return;
    }

    try {
      const raceDetails = await fetchRaceDetails(raceIndex);
      setCharacter((prev) => ({
        ...prev,
        race: raceDetails.name,
        size: raceDetails.size,
        size_description: raceDetails.size_description,
        speed: raceDetails.speed || 30, // Default speed if not provided
        languages: raceDetails.languages?.map((lang) => lang.name) || [],
        language_desc: raceDetails.language_desc || "",
        traits: raceDetails.traits?.map((trait) => trait.name) || [],
      }));
    } catch (error) {
      console.error("Error fetching race details:", error);
    }
  };

  const handleClassChange = async (classIndex) => {
    if (!classIndex) {
      setCharacter((prev) => ({
        ...prev,
        class: "",
        hitDice: "",
        proficiencies: [],
        startingProficiencies: [],
        classProficiencies: [],
        classFeatures: [],
      }));
      return;
    }

    try {
      const classDetails = await fetchClassDetails(classIndex);
      setCharacter((prev) => ({
        ...prev,
        class: classDetails.name,
        hitDice: `d${classDetails.hit_die}`,
        proficiencies: classDetails.proficiencies.map((p) => p.name),
        startingProficiencies: classDetails.proficiencies.map((p) => p.name),
        classProficiencies: classDetails.proficiency_choices.map((p) => p.desc),
      }));

      const features = await fetchClassFeatures(classIndex, character.level);
      setCharacter((prev) => ({
        ...prev,
        classFeatures: features.map(
          (feature) => `Level ${feature.level}: ${feature.name}`
        ),
      }));
    } catch (error) {
      console.error("Error fetching class details:", error);
    }
  };

  const handleLevelChange = async (newLevel) => {
    const clampedLevel = Math.min(Math.max(newLevel, 1), 20);

    character.level = clampedLevel;
    setCharacter((prev) => ({
      ...prev,
      level: clampedLevel,
    }));

    if (character.class) {
      try {
        const features = await fetchClassFeatures(
          character.class,
          clampedLevel
        );
        setCharacter((prev) => ({
          ...prev,
          classFeatures: features.map(
            (feature) => `Level ${feature.level}: ${feature.name}`
          ),
        }));
      } catch (error) {
        console.error("Error fetching class features:", error);
      }
    }
  };

  const handleSpendSlot = (level) => {
    setSpellSlots((prev) => ({
      ...prev,
      [level]: Math.max((prev[level] || 0) - 1, 0),
    }));
  };

  const calculateRemainingSpellPoints = (level) => {
    const maxPoints = spellSlots[level] || 0;
    const usedPoints = selectedSpells.filter((s) => s.level === level).length;
    return maxPoints - usedPoints;
  };

  const addSpellToCharacter = (spell) => {
    const isAlreadySelected = selectedSpells.some((s) => s.name === spell.name);
    if (isAlreadySelected) {
      alert(`You already have ${spell.name} selected.`);
      return;
    }

    const remainingPoints = calculateRemainingSpellPoints(spell.level);
    if (remainingPoints > 0) {
      setSelectedSpells((prev) => [...prev, spell]);
    } else {
      alert(`No remaining spell points for level ${spell.level} spells.`);
    }
  };

  const removeSpellFromCharacter = (spellIndex) => {
    setSelectedSpells((prev) =>
      prev.filter((_, index) => index !== spellIndex)
    );
  };

  const handleSaveCharacter = async () => {
    if (saving) return;
    if (!token) {
      alert("Authentication error. Please log in again.");
      return;
    }
  
    // Enhanced validation with type checking
    const requiredFields = {
      name: { value: character.name, type: 'string' },
      race: { value: character.race, type: 'string' },
      class: { value: character.class, type: 'string' },
      campaignID: { value: character.campaignID, type: 'string' }
    };
  
    const validationErrors = Object.entries(requiredFields)
      .filter(([field, { value, type }]) => !value || typeof value !== type)
      .map(([field]) => field);
  
    if (validationErrors.length > 0) {
      alert(`Invalid or missing fields: ${validationErrors.join(', ')}`);
      return;
    }
  
    setSaving(true);
    try {
      // Prepare character data for saving
      const characterData = {
        name: character.name,
        race: character.race,
        class: character.class,
        level: parseInt(character.level) || 1,
        alignment: character.alignment || "Unaligned",
        stats: Object.fromEntries(
          Object.entries(character.stats).map(([stat, value]) => [stat, parseInt(value) || 0])
        ),
        speed: parseInt(character.speed) || 30,
        hitDice: character.hitDice,
        proficiencies: character.proficiencies,
        size: character.size,
        size_description: character.size_description,
        languages: character.languages,
        language_desc: character.language_desc,
        traits: character.traits,
        startingProficiencies: character.startingProficiencies,
        classProficiencies: character.classProficiencies,
        classFeatures: character.classFeatures,
        campaignID: character.campaignID.toString(),
        selectedSpells: character.selectedSpells || [],
      };

      console.debug("Sending character data:", {
        ...characterData,
        stats: characterData.stats, // Already converted
        token: token ? "***REDACTED***" : "MISSING"
      });

      console.log("Final payload being sent:", JSON.stringify(characterData, null, 2));
      console.log("Auth token exists:", !!token);
  
      let response;
      const startTime = performance.now();
      
      if (character._id) {
        console.log("Updating existing character with ID:", character._id);
        response = await modifyCharacter(character._id, characterData, token);
      } else {
        console.log("Creating new character");
        response = await createCharacter(characterData, token);
      }
  
      const duration = performance.now() - startTime;
      console.log(`API call took ${duration.toFixed(2)}ms`);
      console.log("API response:", response);
  
      const apiStart = Date.now();
  
      console.log(`API call completed in ${Date.now() - apiStart}ms`, response);
  
      if (!response?._id) {
        throw new Error("Server returned invalid response");
      }
  
      alert(`Character ${character._id ? 'updated' : 'created'} successfully!`);
      if (refreshCharacters) refreshCharacters();
    } catch (error) {
      console.error("Save operation failed:", {
        error: error.message,
        stack: error.stack,
        characterData: {
          ...character,
          stats: character.stats,
          campaignID: character.campaignID
        },
        time: new Date().toISOString()
      });
      
      alert(`Save failed: ${error.message || 'Unknown server error'}`);
    } finally {
      setSaving(false);
    }
  };

  const SpellDescriptionModal = ({ spell, onClose }) => {
    if (!spell) return null;

    return (
      <div className="fixed inset-0 bg-tan bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-light-tan p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <h3 className="font-bold text-xl mb-4">{spell.name}</h3>
          <p>{spell.desc || "No description available."}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 p-2 bg-goblin-green text-gold rounded button"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  const handleStatChange = (stat, value) => {
    setCharacter((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: parseInt(value) || 0, // Ensure value is a number
      },
    }));
  };

  const handleDeleteCharacter = async () => {
    if (!character._id) {
      console.error("Cannot delete - no character ID");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this character?")) {
      return;
    }

    try {
      await removeCharacter(character._id, token);
      alert("Character deleted successfully!");
      if (refreshCharacters) refreshCharacters(); // Refresh the character list
      if (onCancel) onCancel(); // Close the form
    } catch (error) {
      console.error("Error deleting character:", error);
      alert("Failed to delete character.");
    }
  };

  const formStyle =
    "w-full p-3 border border-brown rounded-lg outline-none bg-cream focus:shadow-amber-800 placeholder-yellow-700 focus:shadow-sm transition-colors";

  return (
    <div className="p-6 max-w-6xl mx-auto bg-cream rounded-lg shadow-lg shadow-amber-800 text-brown grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Left Section - Race Details */}
      <div className="bg-light-tan p-6 rounded-lg shadow-md shadow-amber-800 col-span-1">
        <h2
          className="button text-xl hover:underline font-bold mb-4 cursor-pointer transition-colors"
          onClick={() => setShowRaceDetails(!showRaceDetails)}
        >
          Race Details {showRaceDetails ? "▲" : "▼"}
        </h2>
        {showRaceDetails && (
          <div className="space-y-3">
            <p>
              <strong>Size:</strong> {character.size}
            </p>
            <p>
              <strong>Size Description:</strong> {character.size_description}
            </p>
            <p>
              <strong>Languages:</strong> {character.languages.join(", ")}
            </p>
            <p>
              <strong>Language Description:</strong> {character.language_desc}
            </p>
            <p>
              <strong>Traits:</strong> {character.traits.join(", ")}
            </p>
          </div>
        )}
      </div>

      {/* Main Character Sheet Form */}
      <div className="bg-light-tan p-6 rounded-lg shadow-md col-span-2">
        <h1 className="text-3xl font-bold mb-6 sancreek-regular">
          D&D Character Sheet
        </h1>
        <form className="space-y-6">
          {/* Character Name Input */}
          <div>
            <label className="block text-lg font-medium mb-2">Name:</label>
            <input
              type="text"
              className={formStyle}
              value={character.name}
              onChange={(e) =>
                setCharacter({ ...character, name: e.target.value })
              }
              placeholder="Enter character name"
            />
          </div>

          {/* Race Dropdown */}
          <div>
            <label className="block text-lg font-medium mb-2">Race:</label>
            <select
              className={formStyle}
              value={
                races.find((race) => race.name === character.race)?.index || ""
              }
              onChange={(e) => handleRaceChange(e.target.value)}
            >
              <option value="">Select a Race</option>
              {races.map((race) => (
                <option key={race.index} value={race.index}>
                  {race.name}
                </option>
              ))}
            </select>
          </div>

          {/* Class Dropdown */}
          <div>
            <label className="block text-lg font-medium mb-2">Class:</label>
            <select
              className={formStyle}
              value={
                classes.find((cls) => cls.name === character.class)?.index || ""
              }
              onChange={(e) => handleClassChange(e.target.value || "")}
            >
              <option value="">Select a Class</option>
              {classes.map((cls) => (
                <option key={cls.index} value={cls.index}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Level Input */}
          <div>
            <label className="block text-lg font-medium mb-2">Level:</label>
            <input
              type="number"
              className={formStyle}
              value={characterLevel}
              onChange={(e) => handleLevelChange(parseInt(e.target.value) || 1)}
              min="1"
              max="20"
            />
          </div>

          {/* Spell Slot Tracker */}
          <SpellSlotTracker
            spellSlots={spellSlots}
            onSpendSlot={handleSpendSlot}
          />

          {/* Spell Modal */}
          {isSpellModalOpen && (
            <SpellModal
              level={selectedSpellLevel}
              spells={spellsByLevel[selectedSpellLevel] || []}
              onAddSpell={addSpellToCharacter}
              onClose={() => setIsSpellModalOpen(false)}
              remainingSpellPoints={calculateRemainingSpellPoints(
                selectedSpellLevel
              )}
              selectedSpells={selectedSpells}
            />
          )}

          {/* Display Selected Spells */}
          <div className="p-6 max-w-4xl mx-auto bg-cream rounded-lg shadow-md mt-6">
            <h2 className="text-xl font-bold mb-4">Selected Spells</h2>
            {/* Display Remaining Spell Points for Each Level */}
            {Object.keys(spellSlots).map((level) => (
              <div key={level} className="mb-4">
                <h3 className="font-bold">Level {level} Spells</h3>
                <p>
                  Remaining Points:{" "}
                  {calculateRemainingSpellPoints(parseInt(level))}
                </p>
              </div>
            ))}
            {/* Display Selected Spells */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedSpells.map((spell, index) => (
                <div
                  key={index}
                  className="p-4 border rounded shadow flex justify-between items-center"
                >
                  <div>
                    <h3
                      className="font-bold cursor-pointer hover:text-yellow-700"
                      onClick={() => setSelectedSpellForDescription(spell)}
                    >
                      {spell.name}
                    </h3>
                    <p>Level: {spell.level}</p>
                    <p>
                      School: {spell.school ? spell.school.name : "Unknown"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpellFromCharacter(index)}
                    className="p-2 bg-cancel-red text-gold rounded button"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Spell Description Modal */}
          {selectedSpellForDescription && (
            <SpellDescriptionModal
              spell={selectedSpellForDescription}
              onClose={() => setSelectedSpellForDescription(null)}
            />
          )}

          {/* Stats Inputs */}
          <div>
            <label className="block text-lg font-medium mb-2">Stats:</label>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(character.stats).map((stat) => (
                <div key={stat}>
                  <label className="block text-sm font-medium mb-1">
                    {stat.charAt(0).toUpperCase() + stat.slice(1)}:
                  </label>
                  <input
                    type="number"
                    className={formStyle}
                    value={character.stats[stat]}
                    onChange={(e) => handleStatChange(stat, e.target.value)}
                    placeholder={`Enter ${stat}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Speed and Passive Perception Inputs */}
          <div className="flex items-center space-x-24 pr-1">
            <div>
              <label className="block text-sm font-medium mb-1">Speed:</label>
              <input
                type="text"
                className={formStyle}
                value={character.speed}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Passive Perception:
              </label>
              <input
                type="text"
                className={formStyle}
                value={10 + Math.floor((character.stats.wisdom - 10) / 2)}
                readOnly
              />
            </div>
          </div>

          {/* Hit Dice Input */}
          <div>
            <label className="block text-lg font-medium mb-2">Hit Dice:</label>
            <input
              type="text"
              className={formStyle}
              value={character.hitDice}
              readOnly
            />
          </div>

          {/* Save button */}
          <button
            onClick={handleSaveCharacter}
            className={`px-4 py-2 rounded ${
              saving ? "bg-tan text-brown" : "bg-goblin-green button text-gold"
            }`}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onCancel}
            className="mt-2 bg-cancel-red text-gold px-4 py-2 rounded shadow-sm shadow-amber-800"
          >
            Cancel
          </button>
        </form>
      </div>

      {/* Add this button near your save/cancel buttons */}
      {!isNew && (
        <button
          onClick={handleDeleteCharacter}
          className="mt-2 bg-cancel-red text-gold px-4 py-2 rounded shadow-sm shadow-amber-800"
        >
          Delete Character
        </button>
      )}

      {/* Right Section - Class Proficiencies and Features */}
      <div className="bg-light-tan p-6 rounded-lg shadow-md col-span-1">
        {/* Class Proficiencies */}
        <div className="mb-6">
          <h2
            className="text-xl font-bold hover:underline mb-4 button cursor-pointer transition-colors"
            onClick={() => setShowClassProficiencies(!showClassProficiencies)}
          >
            Class Proficiencies {showClassProficiencies ? "▲" : "▼"}
          </h2>
          {showClassProficiencies && (
            <div className="space-y-3 text-brown">
              <p>
                <strong>Starting Proficiencies:</strong>{" "}
                {character.startingProficiencies.join(", ")}
              </p>
              <p>
                <strong>Class Proficiency Choices:</strong>{" "}
                {character.classProficiencies.join(", ")}
              </p>
            </div>
          )}
        </div>

        {/* Class Features */}
        <div>
          <h2
            className="text-xl font-bold mb-4 button hover:underline cursor-pointer transition-colors"
            onClick={() => setShowClassFeatures(!showClassFeatures)}
          >
            Class Features {showClassFeatures ? "▲" : "▼"}
          </h2>
          {showClassFeatures && (
            <ul className="list-disc pl-5 space-y-2 ">
              {character.classFeatures.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterStats;

CharacterStats.propTypes = {
  // Class selection props
  onClassSelect: PropTypes.func,
  characterLevel: PropTypes.number,
  onLevelChange: PropTypes.func,

  // Character data props
  displayedCharacter: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string.isRequired,
    race: PropTypes.string,
    class: PropTypes.string,
    level: PropTypes.number,
    alignment: PropTypes.string,
    speed: PropTypes.number,
    hitDice: PropTypes.string,
    stats: PropTypes.shape({
      strength: PropTypes.number,
      dexterity: PropTypes.number,
      constitution: PropTypes.number,
      intelligence: PropTypes.number,
      wisdom: PropTypes.number,
      charisma: PropTypes.number,
    }),
    size: PropTypes.string,
    size_description: PropTypes.string,
    languages: PropTypes.arrayOf(PropTypes.string),
    language_desc: PropTypes.string,
    traits: PropTypes.arrayOf(PropTypes.string),
    startingProficiencies: PropTypes.arrayOf(PropTypes.string),
    classProficiencies: PropTypes.arrayOf(PropTypes.string),
    classFeatures: PropTypes.arrayOf(PropTypes.string),
    campaignID: PropTypes.string,
    selectedSpells: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        level: PropTypes.number.isRequired,
        school: PropTypes.shape({
          name: PropTypes.string.isRequired,
        }),
        desc: PropTypes.string,
      })
    ),
  }).isRequired,

  // Spell management props
  spellSlots: PropTypes.object,
  onSpendSlot: PropTypes.func,
  selectedSpells: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      level: PropTypes.number.isRequired,
      school: PropTypes.shape({
        name: PropTypes.string.isRequired,
      }),
      desc: PropTypes.string,
    })
  ),
  onAddSpell: PropTypes.func,

  // Modal and flow control props
  isNew: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  refreshCharacters: PropTypes.func,
  token: PropTypes.string,

  // Optional spell display props
  spell: PropTypes.shape({
    name: PropTypes.string,
    desc: PropTypes.string,
    level: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    school: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        name: PropTypes.string,
      }),
    ]),
  }),
};
