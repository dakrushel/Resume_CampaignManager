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
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
  const [featureError, setFeatureError] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [expandedLevels, setExpandedLevels] = useState(new Set());

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
      setIsLoadingFeatures(true);
      setFeatureError(null);

      const classDetails = await fetchClassDetails(classIndex);
      const features = await fetchClassFeatures(classIndex, character.level);

      setCharacter((prev) => ({
        ...prev,
        class: classDetails.name,
        hitDice: `d${classDetails.hit_die}`,
        proficiencies: classDetails.proficiencies.map((p) => p.name),
        startingProficiencies: classDetails.proficiencies.map((p) => p.name),
        classProficiencies: classDetails.proficiency_choices.map((p) => p.desc),
        classFeatures: features,
      }));

      // Expand all levels by default
      const levels = new Set(features.map((f) => f.level));
      setExpandedLevels(levels);
    } catch (error) {
      console.error("Error fetching class details:", error);
      setFeatureError("Failed to load class features. Please try again.");
    } finally {
      setIsLoadingFeatures(false);
    }
  };

  const handleLevelChange = async (newLevel) => {
    const clampedLevel = Math.min(Math.max(newLevel, 1), 20);
    onLevelChange(clampedLevel);

    if (character.class) {
      try {
        setIsLoadingFeatures(true);
        setFeatureError(null);

        const features = await fetchClassFeatures(
          character.class,
          clampedLevel
        );
        setCharacter((prev) => ({
          ...prev,
          level: clampedLevel,
          classFeatures: features,
        }));

        // Maintain expanded state for existing levels
        const newLevels = new Set(features.map((f) => f.level));
        const maintainedExpansion = new Set(
          [...expandedLevels].filter((l) => newLevels.has(l))
        );
        setExpandedLevels(maintainedExpansion);
      } catch (error) {
        console.error("Error fetching class features:", error);
        setFeatureError("Failed to load features for this level.");
      } finally {
        setIsLoadingFeatures(false);
      }
    } else {
      setCharacter((prev) => ({
        ...prev,
        level: clampedLevel,
      }));
    }
  };

  const toggleLevelExpansion = (level) => {
    setExpandedLevels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(level)) {
        newSet.delete(level);
      } else {
        newSet.add(level);
      }
      return newSet;
    });
  };

  const FeatureDescriptionModal = ({ feature, onClose }) => {
    if (!feature) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-light-tan p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-xl">{feature.name}</h3>
              {feature.level && (
                <p className="text-sm text-brown">
                  Level {feature.level} Feature
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-brown hover:text-yellow-800"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="prose text-brown">
            {Array.isArray(feature.desc) ? (
              feature.desc.map((paragraph, i) => (
                <p key={i} className="mb-4">
                  {paragraph}
                </p>
              ))
            ) : (
              <p>{feature.desc || "No description available."}</p>
            )}
          </div>

          {feature.subclass && (
            <div className="mt-4 p-3 bg-tan rounded">
              <h4 className="font-bold">Subclass: {feature.subclass.name}</h4>
            </div>
          )}
        </div>
      </div>
    );
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

    setSaving(true);
    try {
      const characterData = {
        name: character.name,
        race: character.race,
        class: character.class,
        level: parseInt(character.level) || 1,
        alignment: character.alignment || "Unaligned",
        stats: Object.fromEntries(
          Object.entries(character.stats).map(([stat, value]) => [
            stat,
            parseInt(value) || 0,
          ])
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

      let result;
      if (character._id) {
        console.log("Updating existing character with ID:", character._id);
        result = await modifyCharacter(character._id, characterData, token);
      } else {
        console.log("Creating new character");
        result = await createCharacter(characterData, token);
      }

      if (!result) {
        throw new Error("Server returned invalid response");
      }

      alert(`Character ${character._id ? "updated" : "created"} successfully!`);
      if (refreshCharacters) refreshCharacters();
    } catch (error) {
      console.error("Save operation failed:", {
        error: error.message,
        characterData: character, // Log the current character state instead
        time: new Date().toISOString(),
      });
      alert(`Save failed: ${error.message || "Unknown server error"}`);
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
    if (!character?._id) {
      console.error("Cannot delete - no character ID");
      alert("No character selected for deletion");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to permanently delete this character?"
      )
    ) {
      return;
    }

    try {
      // Add network check
      if (!navigator.onLine) {
        throw new Error("No internet connection");
      }

      console.log("Attempting to delete character with ID:", character._id);
      console.log("Using token:", token ? "exists" : "missing");

      await removeCharacter(character._id, token);

      console.log("Delete successful");
      alert("Character deleted successfully!");

      // Refresh character list if callback exists
      if (refreshCharacters) {
        await refreshCharacters();
      }

      // Close the form if callback exists
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error("Detailed delete error:", {
        error: error.message,
        stack: error.stack,
        characterId: character._id,
        timestamp: new Date().toISOString(),
      });

      let errorMessage = "Failed to delete character. Please try again.";
      if (error.message.includes("401")) {
        errorMessage = "Session expired. Please log in again.";
      } else if (error.message.includes("404")) {
        errorMessage = "Character not found (may have already been deleted)";
      } else if (error.message.includes("403")) {
        errorMessage = "You don't have permission to delete this character";
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage = "Network error - please check your connection";
      }

      // alert(errorMessage);
    }
  };

  const formStyle =
    "w-full p-3 border border-brown rounded-lg outline-none bg-cream focus:shadow-yellow-800 placeholder-yellow-700 focus:shadow-sm transition-colors";

    return (
      <div className="p-6 max-w-6xl mx-auto bg-yellow-600 rounded-xl shadow-lg shadow-yellow-800/50 text-yellow-900 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Section - Race Details */}
        <div className="bg-yellow-100 p-6 rounded-xl shadow-md border border-yellow-200 col-span-1">
          <h2
            className="text-xl font-bold mb-4 cursor-pointer flex items-center justify-between"
            onClick={() => setShowRaceDetails(!showRaceDetails)}
          >
            <span className="hover:text-yellow-700 transition-colors">Race Details</span>
            <span className="text-yellow-600">{showRaceDetails ? "▲" : "▼"}</span>
          </h2>
          {showRaceDetails && (
            <div className="space-y-3 text-yellow-800">
              {[
                { label: "Size", value: character.size },
                { label: "Size Description", value: character.size_description },
                { label: "Languages", value: character.languages.join(", ") },
                { label: "Language Description", value: character.language_desc },
                { label: "Traits", value: character.traits.join(", ") }
              ].map((item, index) => (
                <div key={index} className="border-b border-yellow-200 pb-2 last:border-0">
                  <p className="font-semibold text-yellow-700">{item.label}</p>
                  <p className="text-yellow-900">{item.value || "-"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
    
        {/* Main Character Sheet Form */}
        <div className="bg-yellow-100 p-6 rounded-xl shadow-md border border-yellow-200 col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-yellow-800 font-serif">Character Sheet</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Level</span>
              <input
                type="number"
                className="w-16 px-3 py-1 rounded border border-yellow-300 bg-yellow-50 text-center"
                value={characterLevel}
                onChange={(e) => handleLevelChange(parseInt(e.target.value) || 1)}
                min="1"
                max="20"
              />
            </div>
          </div>
    
          <form className="space-y-6">
            {/* Character Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-yellow-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded border border-yellow-300 bg-yellow-50 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  value={character.name}
                  onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                  placeholder="Character name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-yellow-700 mb-1">Race</label>
                <select
                  className="w-full px-3 py-2 rounded border border-yellow-300 bg-yellow-50 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  value={races.find((race) => race.name === character.race)?.index || ""}
                  onChange={(e) => handleRaceChange(e.target.value)}
                >
                  <option value="">Select Race</option>
                  {races.map((race) => (
                    <option key={race.index} value={race.index}>
                      {race.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-yellow-700 mb-1">Class</label>
                <select
                  className="w-full px-3 py-2 rounded border border-yellow-300 bg-yellow-50 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  value={classes.find((cls) => cls.name === character.class)?.index || ""}
                  onChange={(e) => handleClassChange(e.target.value || "")}
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.index} value={cls.index}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-yellow-700 mb-1">Hit Dice</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded border border-yellow-300 bg-yellow-50"
                  value={character.hitDice}
                  readOnly
                />
              </div>
            </div>
    
            {/* Stats Section */}
            <div className="bg-yellow-200/30 p-4 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">Ability Scores</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(character.stats).map(([stat, value]) => (
                  <div key={stat} className="bg-yellow-100 p-2 rounded border border-yellow-200">
                    <label className="block text-xs font-medium text-yellow-600 uppercase tracking-wider">
                      {stat}
                    </label>
                    <input
                      type="number"
                      className="w-full px-2 py-1 bg-white rounded border border-yellow-300 text-center font-bold text-yellow-900"
                      value={value}
                      onChange={(e) => handleStatChange(stat, e.target.value)}
                    />
                    <div className="text-center text-sm mt-1">
                      {Math.floor((value - 10) / 2) >= 0 ? "+" : ""}
                      {Math.floor((value - 10) / 2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
    
            {/* Spell Section */}
            <div className="space-y-4">
              <SpellSlotTracker
                spellSlots={spellSlots}
                onSpendSlot={handleSpendSlot}
              />
              
              {Object.keys(spellSlots).length > 0 && (
                <div className="bg-yellow-200/30 p-4 rounded-lg border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">Selected Spells</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedSpells.map((spell, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-yellow-200 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-yellow-900 hover:text-yellow-700 cursor-pointer"
                              onClick={() => setSelectedSpellForDescription(spell)}>
                              {spell.name}
                            </h4>
                            <div className="flex space-x-2 text-xs text-yellow-600 mt-1">
                              <span>Lvl {spell.level}</span>
                              <span>•</span>
                              <span>{spell.school?.name || "Unknown School"}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeSpellFromCharacter(index)}
                            className="text-xs bg-yellow-100 hover:bg-yellow-200 px-2 py-1 rounded transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
    
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <button
                onClick={handleSaveCharacter}
                className={`px-4 py-2 rounded-lg font-medium ${
                  saving ? "bg-yellow-300 text-yellow-800" : "bg-yellow-600 hover:bg-yellow-700 text-white"
                } transition-colors`}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Character"}
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg font-medium bg-yellow-100 hover:bg-yellow-200 text-yellow-800 transition-colors"
              >
                Cancel
              </button>
              {!isNew && (
                <button
                  onClick={handleDeleteCharacter}
                  className="px-4 py-2 rounded-lg font-medium bg-red-100 hover:bg-red-200 text-red-800 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </form>
        </div>
    
        {/* Right Section - Class Details */}
        <div className="bg-yellow-100 p-6 rounded-xl shadow-md border border-yellow-200 col-span-1 space-y-6">
          {/* Proficiencies */}
          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <h2
              className="text-lg font-semibold text-yellow-800 mb-3 cursor-pointer flex justify-between items-center"
              onClick={() => setShowClassProficiencies(!showClassProficiencies)}
            >
              <span>Class Proficiencies</span>
              <span className="text-yellow-600">{showClassProficiencies ? "▲" : "▼"}</span>
            </h2>
            {showClassProficiencies && (
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium text-yellow-700">Starting Proficiencies:</h4>
                  <p className="text-yellow-900">
                    {character.startingProficiencies.join(", ") || "None"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-yellow-700">Proficiency Choices:</h4>
                  <p className="text-yellow-900">
                    {character.classProficiencies.join(", ") || "None"}
                  </p>
                </div>
              </div>
            )}
          </div>
    
          {/* Features */}
          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <div className="flex justify-between items-center mb-3">
              <h2
                className="text-lg font-semibold text-yellow-800 cursor-pointer"
                onClick={() => setShowClassFeatures(!showClassFeatures)}
              >
                Class Features
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-yellow-600">{showClassFeatures ? "▲" : "▼"}</span>
                {showClassFeatures && (
                  <button
                    onClick={() => setExpandedLevels(new Set())}
                    className="text-xs bg-yellow-100 hover:bg-yellow-200 px-2 py-1 rounded"
                  >
                    Collapse All
                  </button>
                )}
              </div>
            </div>
            
            {showClassFeatures && (
              <div className="space-y-3">
                {isLoadingFeatures ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-600"></div>
                  </div>
                ) : character.classFeatures.length > 0 ? (
                  Array.from(new Set(character.classFeatures.map(f => f.level)))
                    .sort((a, b) => a - b)
                    .map(level => (
                      <div key={level} className="border border-yellow-200 rounded-lg overflow-hidden">
                        <div
                          className="flex justify-between items-center p-2 bg-yellow-100 cursor-pointer"
                          onClick={() => toggleLevelExpansion(level)}
                        >
                          <h3 className="font-medium text-yellow-800">Level {level}</h3>
                          <span className="text-yellow-600">
                            {expandedLevels.has(level) ? "−" : "+"}
                          </span>
                        </div>
                        {expandedLevels.has(level) && (
                          <ul className="divide-y divide-yellow-100">
                            {character.classFeatures
                              .filter(f => f.level === level)
                              .map((feature, index) => (
                                <li
                                  key={index}
                                  className="p-2 hover:bg-yellow-50 cursor-pointer"
                                  onClick={() => setSelectedFeature(feature)}
                                >
                                  <h4 className="font-medium text-yellow-700">{feature.name}</h4>
                                  {feature.desc && (
                                    <p className="text-xs text-yellow-600 line-clamp-2">
                                      {Array.isArray(feature.desc) ? feature.desc[0] : feature.desc}
                                    </p>
                                  )}
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>
                    ))
                ) : (
                  <p className="text-center text-yellow-600 py-2">
                    {character.class ? "No features available" : "Select a class"}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
    
        {/* Modals */}
        {selectedSpellForDescription && (
          <SpellDescriptionModal
            spell={selectedSpellForDescription}
            onClose={() => setSelectedSpellForDescription(null)}
          />
        )}
        {selectedFeature && (
          <FeatureDescriptionModal
            feature={selectedFeature}
            onClose={() => setSelectedFeature(null)}
          />
        )}
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
  isNew: PropTypes.bool,
  onCancel: PropTypes.func,
  refreshCharacters: PropTypes.func.isRequired,
  campaignID: PropTypes.string.isRequired,

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
