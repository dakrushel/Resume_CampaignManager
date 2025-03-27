/*=============================================
*   Title: Player Character Stats Logic (Heavy)
*   Author: Grimm_mmirG
*   Date: 2025-26-02
===============================================*/

import { useState, useEffect } from "react";
import { SpellSlotTable } from "./spelldata";
import { getLocalSpellSlots } from "./spelldata";
import SpellModal from "./spellmodal";
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
  const [initialCharacter, setInitialCharacter] = useState({});
  const [saving, setSaving] = useState(false); // Prevent duplicate submissions
  const token = useAuthToken();
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
  const [featureError, setFeatureError] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [expandedLevels, setExpandedLevels] = useState(new Set());
  const [showRaceDetails, setShowRaceDetails] = useState(false);
  const [showClassProficiencies, setShowClassProficiencies] = useState(false);
  const [showClassFeatures, setShowClassFeatures] = useState(false);
  const [previousLevel, setPreviousLevel] = useState(characterLevel);
  const [savedLevel, setSavedLevel] = useState(1);
  const [featureLoading, setFeatureLoading] = useState(false);

  const [spellSlots, setSpellSlots] = useState({});
  const [usedSlots, setUsedSlots] = useState({});
  const [isSpellModalOpen, setIsSpellModalOpen] = useState(false);
  const [selectedSpellLevel, setSelectedSpellLevel] = useState(null);
  const [spellsByLevel, setSpellsByLevel] = useState({});
  const [selectedSpells, setSelectedSpells] = useState([]);
  const [spells, setSpells] = useState([]);
  const [spellsLoading, setSpellsLoading] = useState(false);
  const [spellsError, setSpellsError] = useState(null);
  const [selectedSpellForDescription, setSelectedSpellForDescription] =
    useState(null); // Track selected spell for description
  const [spellSlotsState, setSpellSlotsState] = useState({
    loading: false,
    error: null,
    slots: {},
    available: {}, // Track remaining slots
  });
  // Add this near your other state declarations
  const [preparedSpells, setPreparedSpells] = useState([]);
  const [knownCantrips, setKnownCantrips] = useState([]);
  const [availableSpells, setAvailableSpells] = useState([]);

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
    const loadSpellData = async () => {
      if (!character.class || !character.level) return;

      try {
        // Load spell slots
        const slots = getLocalSpellSlots(
          character.class.toLowerCase(),
          character.level
        );
        setSpellSlots(slots || {});
        setUsedSlots(character.usedSlots || {});

        // Load spells if they exist in character data
        if (character.selectedSpells?.length > 0) {
          const prepared = character.selectedSpells.filter((s) => s.level > 0);
          const cantrips = character.selectedSpells.filter(
            (s) => s.level === 0
          );
          setPreparedSpells(prepared);
          setKnownCantrips(cantrips);
        } else {
          // Load spells from API if none saved
          const spells = await fetchClassSpells(character.class.toLowerCase());
          setAvailableSpells(spells);
        }
      } catch (error) {
        console.error("Error loading spell data:", error);
      }
    };

    loadSpellData();
  }, [
    character.class,
    character.level,
    character.selectedSpells,
    character.usedSlots,
  ]);

  useEffect(() => {
    if (displayedCharacter && Object.keys(displayedCharacter).length > 0) {
      // In the transformFromBackend function
      const transformFromBackend = (slots) => {
        if (!slots) return {};
        const transformed = {};
        Object.entries(slots).forEach(([key, value]) => {
          const level = key.replace("level_", "");
          transformed[level] = value;
        });
        return transformed;
      };

      const transformedCharacter = {
        ...displayedCharacter,
        level: displayedCharacter.level || 1, // Ensure level exists
        spellSlots: transformFromBackend(displayedCharacter.spellSlots),
        usedSlots: transformFromBackend(displayedCharacter.usedSlots),
      };

      // Update all relevant states
      setCharacter(transformedCharacter);
      setInitialCharacter(transformedCharacter);
      setSavedLevel(transformedCharacter.level); // Track saved level
      setPreviousLevel(transformedCharacter.level);

      // Trigger level-dependent updates
      if (transformedCharacter.class) {
        updateLevelDependentData(
          transformedCharacter.level,
          transformedCharacter.class
        );
      }

      // Load spells if needed (only for current level)
      if (isSpellcastingClass(transformedCharacter.class)) {
        const slots = getLocalSpellSlots(
          transformedCharacter.class.toLowerCase(),
          transformedCharacter.level
        );
        setSpellSlots(slots || {});
        setUsedSlots(transformFromBackend(displayedCharacter.usedSlots) || {});
      }
    }
  }, [displayedCharacter]);

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

  const handleFeatureClick = async (feature) => {
    // If we already have the description, show it immediately
    if (feature.desc) {
      setSelectedFeature(feature);
      return;
    }

    // Otherwise, fetch the details first
    try {
      setFeatureLoading(true);
      const featureDetails = await fetchFeatureDetails(feature.index);
      setSelectedFeature({
        ...feature,
        ...featureDetails,
      });
    } catch (error) {
      console.error("Error loading feature details:", error);
      setSelectedFeature({
        ...feature,
        desc: ["Could not load feature details"],
      });
    } finally {
      setFeatureLoading(false);
    }
  };

  // Add this helper function near your other utility functions
  const calculateHP = (character) => {
    if (!character.hitDice) return 0;

    const hitDieSize = parseInt(character.hitDice.substring(1)); // Extract the number from "d8"
    const conModifier = Math.floor((character.stats.constitution - 10) / 2);

    // Level 1 gets max hit die + CON mod
    if (character.level === 1) {
      return hitDieSize + conModifier;
    }

    // Higher levels get average (rounded up) + CON mod per level
    const averagePerLevel = Math.ceil(hitDieSize / 2 + 1);
    return (
      hitDieSize +
      conModifier +
      (averagePerLevel + conModifier) * (character.level - 1)
    );
  };

  // Add this effect to update HP when relevant stats change
  useEffect(() => {
    if (character.hitDice && character.stats?.constitution && character.level) {
      const newMaxHP = calculateHP(character);
      setCharacter((prev) => ({
        ...prev,
        hitPoints: {
          ...prev.hitPoints,
          max: newMaxHP,
          // Keep current HP at max if it was 0 (new character)
          current: prev.hitPoints?.current || newMaxHP,
        },
      }));
    }
  }, [character.hitDice, character.stats?.constitution, character.level]);

  // Add this handler for HP changes
  const handleHPChange = (type, value) => {
    const numValue = parseInt(value) || 0;
    setCharacter((prev) => {
      const newHP = {
        ...prev.hitPoints,
        [type]: Math.max(0, numValue),
      };

      // Ensure current doesn't exceed max
      if (type === "max" && newHP.current > numValue) {
        newHP.current = numValue;
      }

      return {
        ...prev,
        hitPoints: newHP,
      };
    });
  };

  const updateLevelDependentData = async (level, className) => {
    // Update class features if class exists
    if (className) {
      try {
        setIsLoadingFeatures(true);
        const features = await fetchClassFeatures(className, level);
        setCharacter((prev) => ({
          ...prev,
          classFeatures: features,
        }));

        // Maintain expanded levels
        const newLevels = new Set(features.map((f) => f.level));
        const maintainedExpansion = new Set(
          [...expandedLevels].filter((l) => newLevels.has(l))
        );
        setExpandedLevels(maintainedExpansion);
      } catch (error) {
        console.error("Error loading features:", error);
        setFeatureError("Failed to load class features");
      } finally {
        setIsLoadingFeatures(false);
      }
    }

    // Update spell slots if spellcasting class
    if (className && isSpellcastingClass(className)) {
      try {
        const slots = getLocalSpellSlots(className.toLowerCase(), level);
        setSpellSlots(slots || {});
        setUsedSlots({});
      } catch (error) {
        console.error("Error loading spell slots:", error);
      }
    }
  };

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

      // Update character with class details
      setCharacter((prev) => ({
        ...prev,
        class: classDetails.name,
        hitDice: `d${classDetails.hit_die}`,
        proficiencies: classDetails.proficiencies.map((p) => p.name),
        startingProficiencies: classDetails.proficiencies.map((p) => p.name),
        classProficiencies: classDetails.proficiency_choices.map((p) => p.desc),
      }));

      // Then update level-dependent data for the new class
      await updateLevelDependentData(character.level, classDetails.name);
    } catch (error) {
      console.error("Error fetching class details:", error);
      setFeatureError("Failed to load class features. Please try again.");
    } finally {
      setIsLoadingFeatures(false);
    }
  };

  const handleLevelChange = async (newLevel) => {
    const clampedLevel = Math.min(Math.max(parseInt(newLevel), 1), 20) || 1;

    // Update the character's level immediately
    setCharacter((prev) => ({
      ...prev,
      level: clampedLevel,
    }));

    // Only update features if class exists
    if (!character.class) return;

    try {
      setIsLoadingFeatures(true);
      const features = await fetchClassFeatures(character.class, clampedLevel);

      setCharacter((prev) => ({
        ...prev,
        classFeatures: features,
      }));

      // Update expanded levels UI
      const newLevels = new Set(features.map((f) => f.level));
      const maintainedExpansion = new Set(
        [...expandedLevels].filter((l) => newLevels.has(l))
      );
      setExpandedLevels(maintainedExpansion);
    } catch (error) {
      console.error("Error loading features:", error);
      setFeatureError("Failed to load features");
    } finally {
      setIsLoadingFeatures(false);
    }

    // Update spell slots if spellcasting class
    if (isSpellcastingClass(character.class)) {
      const slots = getLocalSpellSlots(
        character.class.toLowerCase(),
        clampedLevel
      );
      setSpellSlots(slots || {});
      setUsedSlots({});
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
          {featureLoading && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-600"></div>
            </div>
          )}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-xl">{feature.name}</h3>
              {feature.level && (
                <p className="text-sm text-brown">
                  Level {feature.level} {feature.class?.name || ""} Feature
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

          {feature.prerequisites && feature.prerequisites.length > 0 && (
            <div className="mt-4 p-3 bg-tan rounded">
              <h4 className="font-bold mb-2">Prerequisites:</h4>
              <ul className="list-disc pl-5">
                {feature.prerequisites.map((prereq, i) => (
                  <li key={i}>
                    {prereq.type === "level" && `Level ${prereq.level}`}
                    {prereq.type === "feature" && `Feature: ${prereq.name}`}
                    {prereq.type === "spell" && `Spell: ${prereq.name}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Replace your current spell slot functions with these:
  const handleSpendSlot = (spellLevel) => {
    setUsedSlots((prev) => ({
      ...prev,
      [spellLevel]: (prev[spellLevel] || 0) + 1,
    }));
  };

  // Add this function to reset slots
  const handleResetSlots = () => {
    setUsedSlots({});
  };

  const handlePrepareSpell = (spell) => {
    // Cantrips don't use slots
    if (spell.level === 0) {
      setKnownCantrips((prev) => [...prev, spell]);
      setAvailableSpells((prev) => prev.filter((s) => s.index !== spell.index));
      return;
    }

    // Check available slots
    const remainingSlots = calculateRemainingSpellPoints(spell.level);
    if (remainingSlots <= 0) {
      alert(`No remaining spell slots for level ${spell.level} spells.`);
      return;
    }

    // Deduct slot first
    setUsedSlots((prev) => ({
      ...prev,
      [spell.level]: (prev[spell.level] || 0) + 1,
    }));

    // Then add the spell
    setPreparedSpells((prev) => [...prev, spell]);
    setAvailableSpells((prev) => prev.filter((s) => s.index !== spell.index));

    // Close modal if you want
    setIsSpellModalOpen(false);
  };

  const handleUnprepareSpell = (spell) => {
    if (spell.level === 0) {
      setKnownCantrips((prev) => prev.filter((s) => s.index !== spell.index));
    } else {
      setPreparedSpells((prev) => prev.filter((s) => s.index !== spell.index));
    }

    // Add back to available spells
    setAvailableSpells((prev) => [...prev, spell]);
  };

  // Add this helper function near the top of your file
  const isSpellcastingClass = (className) => {
    const spellcastingClasses = [
      "wizard",
      "cleric",
      "druid",
      "bard",
      "sorcerer",
      "warlock",
      "paladin",
      "ranger",
    ];
    return spellcastingClasses.includes(className.toLowerCase());
  };

  // Then modify your SpellSlotTable rendering:
  {
    isSpellcastingClass(character.class) && (
      <SpellSlotTable
        className={character.class.toLowerCase()}
        level={character.level}
        onSpendSlot={handleSpendSlot}
      />
    );
  }

  const calculateRemainingSpellPoints = (spellLevel) => {
    // Handle both numeric keys (1) and string keys ("level_1")
    const slotKey =
      spellLevel in spellSlots ? spellLevel : `level_${spellLevel}`;
    const totalSlots = spellSlots[slotKey] || 0;
    const used = usedSlots[slotKey] || 0;
    return Math.max(totalSlots - used, 0);
  };

  const handleAddSpell = (spell) => {
    // Check if already selected
    if (selectedSpells.some((s) => s.index === spell.index)) {
      alert(`${spell.name} is already selected.`);
      return;
    }

    // Check available slots
    const remainingSlots = calculateRemainingSpellPoints(spell.level);
    if (remainingSlots <= 0) {
      alert(`No remaining spell slots for level ${spell.level} spells.`);
      return;
    }

    setSelectedSpells((prev) => [...prev, spell]);
    setIsSpellModalOpen(false);
  };

  const handleRemoveSpell = (spellIndex) => {
    setSelectedSpells((prev) =>
      prev.filter((spell) => spell.index !== spellIndex)
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
      const transformSpellSlots = (slots) => {
        if (!slots) return {};
        const transformed = {};
        Object.entries(slots).forEach(([level, value]) => {
          const levelNum =
            typeof level === "string" && level.startsWith("level_")
              ? level.replace("level_", "")
              : level;
          transformed[`level_${levelNum}`] = value;
        });
        return transformed;
      };

      const preparedSpellsData = preparedSpells.map((spell) => ({
        ...spell,
        desc: Array.isArray(spell.desc)
          ? spell.desc.join("\n\n")
          : spell.desc || "",
      }));

      const knownCantripsData = knownCantrips.map((cantrip) => ({
        ...cantrip,
        level: 0,
        desc: Array.isArray(cantrip.desc)
          ? cantrip.desc.join("\n\n")
          : cantrip.desc || "",
      }));

      const characterData = {
        name: character.name.trim(),
        alignment: character.alignment || "Unaligned",
        race: character.race,
        class: character.class,
        hitPoints: {
          max: character.hitPoints?.max || calculateHP(character),
          current: character.hitPoints?.current || calculateHP(character),
          temporary: character.hitPoints?.temporary || 0,
        },
        level: character.level,
        stats: {
          strength: parseInt(character.stats.strength) || 10,
          dexterity: parseInt(character.stats.dexterity) || 10,
          constitution: parseInt(character.stats.constitution) || 10,
          intelligence: parseInt(character.stats.intelligence) || 10,
          wisdom: parseInt(character.stats.wisdom) || 10,
          charisma: parseInt(character.stats.charisma) || 10,
        },
        campaignID: character.campaignID,
        speed: parseInt(character.speed) || 30,
        hitDice: character.hitDice,
        proficiencies: character.proficiencies || [],
        size: character.size,
        size_description: character.size_description || "",
        languages: character.languages || [],
        language_desc: character.language_desc || "",
        traits: character.traits || [],
        startingProficiencies: character.startingProficiencies || [],
        classProficiencies: character.classProficiencies || [],
        classFeatures: character.classFeatures?.map((f) => f.name || f) || [],
        selectedSpells: [...preparedSpellsData, ...knownCantripsData],
        spellSlots: transformSpellSlots(spellSlots),
        usedSlots: transformSpellSlots(usedSlots),
      };

      console.log("Final character data:", characterData);

      let result;
      if (character._id) {
        result = await modifyCharacter(character._id, characterData, token);
      } else {
        result = await createCharacter(characterData, token);
      }

      // Update saved states after successful save
      setInitialCharacter(characterData);
      setSavedLevel(character.level);

      alert(`Character ${character._id ? "updated" : "created"} successfully!`);
      if (refreshCharacters) refreshCharacters();
    } catch (error) {
      console.error("Save operation failed:", error);
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
          <span className="hover:text-yellow-700 transition-colors">
            Race Details
          </span>
          <span className="text-yellow-600">{showRaceDetails ? "▲" : "▼"}</span>
        </h2>
        {showRaceDetails && (
          <div className="space-y-3 text-yellow-800">
            {[
              { label: "Size", value: character.size },
              { label: "Size Description", value: character.size_description },
              { label: "Languages", value: character.languages.join(", ") },
              { label: "Language Description", value: character.language_desc },
              { label: "Traits", value: character.traits.join(", ") },
            ].map((item, index) => (
              <div
                key={index}
                className="border-b border-yellow-200 pb-2 last:border-0"
              >
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
          <h1 className="text-3xl font-bold text-yellow-800 font-serif">
            Character Sheet
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Level</span>
            <input
              type="number"
              className="w-16 px-3 py-1 rounded border border-yellow-300 bg-yellow-50 text-center"
              value={character.level || 1}
              onChange={(e) => handleLevelChange(e.target.value)}
              min="1"
              max="20"
            />
          </div>
        </div>

        <form className="space-y-6">
          {/* Character Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-yellow-700 mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded border border-yellow-300 bg-yellow-50 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                value={character.name}
                onChange={(e) =>
                  setCharacter({ ...character, name: e.target.value })
                }
                placeholder="Character name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-700 mb-1">
                Race
              </label>
              <select
                className="w-full px-3 py-2 rounded border border-yellow-300 bg-yellow-50 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                value={
                  races.find((race) => race.name === character.race)?.index ||
                  ""
                }
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
              <label className="block text-sm font-medium text-yellow-700 mb-1">
                Class
              </label>
              <select
                className="w-full px-3 py-2 rounded border border-yellow-300 bg-yellow-50 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                value={
                  classes.find((cls) => cls.name === character.class)?.index ||
                  ""
                }
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
              <label className="block text-sm font-medium text-yellow-700 mb-1">
                Hit Dice
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded border border-yellow-300 bg-yellow-50"
                value={character.hitDice}
                readOnly
              />
            </div>
            {/* Add this after the Hit Dice input */}
            {/* Compact HP Section */}
            <div className="space-y-2">
              {/* HP Values - Horizontal Layout */}
              <div className="grid grid-cols-3 gap-3">
                {/* Max HP */}
                <div>
                  <label className="block text-xs font-medium text-yellow-700 mb-0.5">
                    Max HP
                  </label>
                  <input
                    type="number"
                    className="w-full px-2 py-1 text-sm rounded border border-yellow-300 bg-yellow-50"
                    value={character.hitPoints?.max || 0}
                    readOnly
                  />
                </div>

                {/* Current HP */}
                <div>
                  <label className="block text-xs font-medium text-yellow-700 mb-0.5">
                    Current HP
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      className="flex-1 px-2 py-1 text-sm rounded-l border border-yellow-300 bg-yellow-50"
                      value={character.hitPoints?.current || 0}
                      onChange={(e) =>
                        handleHPChange("current", Number(e.target.value))
                      }
                      min="0"
                      max={character.hitPoints?.max || 0}
                    />
                    <div className="flex flex-col border border-l-0 border-yellow-300 rounded-r overflow-hidden">
                      <button
                        onClick={() =>
                          handleHPChange(
                            "current",
                            Math.min(
                              (character.hitPoints?.current || 0) + 1,
                              character.hitPoints?.max || 0
                            )
                          )
                        }
                        className="px-1 bg-green-50 hover:bg-green-100 text-xs h-1/2 border-b border-yellow-300"
                        title="Heal 1 HP"
                      >
                        +
                      </button>
                      <button
                        onClick={() =>
                          handleHPChange(
                            "current",
                            Math.max((character.hitPoints?.current || 0) - 1, 0)
                          )
                        }
                        className="px-1 bg-red-50 hover:bg-red-100 text-xs h-1/2"
                        title="Damage 1 HP"
                      >
                        -
                      </button>
                    </div>
                  </div>
                </div>

                {/* Temp HP */}
                <div>
                  <label className="block text-xs font-medium text-yellow-700 mb-0.5">
                    Temp HP
                  </label>
                  <input
                    type="number"
                    className="w-full px-2 py-1 text-sm rounded border border-yellow-300 bg-yellow-50"
                    value={character.hitPoints?.temporary || 0}
                    onChange={(e) =>
                      handleHPChange("temporary", Number(e.target.value))
                    }
                    min="0"
                  />
                </div>
              </div>

              {/* Compact Health Bar */}
              <div className="pt-1">
                <div className="flex justify-between text-xs text-yellow-700 mb-0.5">
                  <span>
                    {character.hitPoints?.current || 0}/
                    {character.hitPoints?.max || 0}
                  </span>
                  {character.hitPoints?.temporary > 0 && (
                    <span className="text-amber-700">
                      +{character.hitPoints.temporary} Temp
                    </span>
                  )}
                </div>
                <div className="w-full bg-yellow-100 rounded-full h-1.5">
                  <div
                    className="bg-red-500 h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        ((character.hitPoints?.current || 0) /
                          (character.hitPoints?.max || 1)) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-700 mb-1">
                Speed:
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded border border-yellow-300 bg-yellow-50"
                value={character.speed}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-700 mb-1">
                Passive Perception:
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded border border-yellow-300 bg-yellow-50"
                value={10 + Math.floor((character.stats.wisdom - 10) / 2)}
                readOnly
              />
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-yellow-200/30 p-4 rounded-lg border border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">
              Ability Scores
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(character.stats).map(([stat, value]) => (
                <div
                  key={stat}
                  className="bg-yellow-100 p-2 rounded border border-yellow-200"
                >
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

          {/* Spell Management Section */}
          {isSpellcastingClass(character.class) && (
            <div className="space-y-4">
              <div className="bg-yellow-100 p-4 rounded-lg">
                {/* Spell Slot Tracker */}
                <div className="mb-6 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-lg mb-2">Spell Slots</h3>
                  <SpellSlotTable
                    className={character.class.toLowerCase()}
                    level={character.level}
                    onSpendSlot={handleSpendSlot}
                    usedSlots={usedSlots}
                    onResetSlots={handleResetSlots}
                  />

                  {/* Slot Status Summary */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
                      const remaining = calculateRemainingSpellPoints(level);
                      const total =
                        spellSlots[level] || spellSlots[`level_${level}`] || 0;
                      if (total <= 0 && level !== 0) return null;

                      return (
                        <div
                          key={level}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            level === 0
                              ? "bg-purple-100 text-purple-800"
                              : remaining <= 0
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {level === 0 ? "Cantrips" : `Lvl ${level}`}:{" "}
                          {remaining}/{total}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Spell Management Buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
                    const remaining = calculateRemainingSpellPoints(level);
                    const total =
                      spellSlots[level] || spellSlots[`level_${level}`] || 0;
                    if (total <= 0) return null;

                    return (
                      <button
                        key={level}
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedSpellLevel(level);
                          setIsSpellModalOpen(true);
                        }}
                        disabled={remaining <= 0}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                          remaining <= 0
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        <span>+</span>
                        <span>Lvl {level} Spells</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            remaining <= 0 ? "bg-gray-400" : "bg-blue-800"
                          }`}
                        >
                          {remaining}/{total}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Spell Modal */}
                {isSpellModalOpen && (
                  <SpellModal
                    level={selectedSpellLevel}
                    classIndex={character.class.toLowerCase()}
                    onAddSpell={handlePrepareSpell}
                    onClose={() => setIsSpellModalOpen(false)}
                    remainingSpellPoints={calculateRemainingSpellPoints(
                      selectedSpellLevel
                    )}
                    selectedSpells={[...preparedSpells, ...knownCantrips]}
                    availableSpells={availableSpells}
                  />
                )}

                {/* Prepared Spells Section */}
                <div className="bg-white p-4 rounded-lg mb-4 border border-yellow-200 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-lg">Prepared Spells</h3>
                    <span className="text-sm text-gray-500">
                      {preparedSpells.length} spells prepared
                    </span>
                  </div>

                  {preparedSpells.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {preparedSpells.map((spell) => (
                        <div
                          key={spell.index}
                          className="group bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 flex justify-between items-center transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              Lvl {spell.level}
                            </span>
                            <span className="font-medium">{spell.name}</span>
                          </div>
                          <button
                            onClick={() => handleUnprepareSpell(spell)}
                            className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-sm transition-opacity"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded">
                      <p className="text-gray-500 italic">
                        No spells prepared yet
                      </p>
                    </div>
                  )}
                </div>

                {/* Known Cantrips Section */}
                <div className="bg-white p-4 rounded-lg border border-yellow-200 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-lg">Known Cantrips</h3>
                    <span className="text-sm text-gray-500">
                      {knownCantrips.length} cantrips known
                    </span>
                  </div>

                  {knownCantrips.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {knownCantrips.map((spell) => (
                        <div
                          key={spell.index}
                          className="group bg-white p-3 rounded-lg border border-gray-200 hover:border-purple-300 flex justify-between items-center transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                              Cantrip
                            </span>
                            <span className="font-medium">{spell.name}</span>
                          </div>
                          <button
                            onClick={() => handleUnprepareSpell(spell)}
                            className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-sm transition-opacity"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded">
                      <p className="text-gray-500 italic">
                        No cantrips known yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <button
              onClick={handleSaveCharacter}
              className={`px-4 py-2 rounded-lg font-medium ${
                saving
                  ? "bg-yellow-300 text-yellow-800"
                  : "bg-yellow-600 hover:bg-yellow-700 text-white"
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
            <span className="text-yellow-600">
              {showClassProficiencies ? "▲" : "▼"}
            </span>
          </h2>
          {showClassProficiencies && (
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium text-yellow-700">
                  Starting Proficiencies:
                </h4>
                <p className="text-yellow-900">
                  {character.startingProficiencies.join(", ") || "None"}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-yellow-700">
                  Proficiency Choices:
                </h4>
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
              <span className="text-xs text-yellow-600">
                {showClassFeatures ? "▲" : "▼"}
              </span>
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
                Array.from(new Set(character.classFeatures.map((f) => f.level)))
                  .sort((a, b) => a - b)
                  .map((level) => (
                    <div
                      key={level}
                      className="border border-yellow-200 rounded-lg overflow-hidden"
                    >
                      <div
                        className="flex justify-between items-center p-2 bg-yellow-100 cursor-pointer"
                        onClick={() => toggleLevelExpansion(level)}
                      >
                        <h3 className="font-medium text-yellow-800">
                          Level {level}
                        </h3>
                        <span className="text-yellow-600">
                          {expandedLevels.has(level) ? "−" : "+"}
                        </span>
                      </div>
                      {expandedLevels.has(level) && (
                        <ul className="divide-y divide-yellow-100">
                          {character.classFeatures
                            .filter((f) => f.level === level)
                            .map((feature, index) => (
                              <li
                                key={feature.index || index} // Use feature.index if available
                                className="p-2 hover:bg-yellow-50 cursor-pointer group"
                                onClick={() => setSelectedFeature(feature)}
                              >
                                <div className="flex justify-between items-start">
                                  <h4 className="font-medium text-yellow-700">
                                    {feature.name}
                                  </h4>
                                  <button
                                    className="opacity-0 group-hover:opacity-100 text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedFeature(feature);
                                    }}
                                  >
                                    View
                                  </button>
                                </div>
                                {feature.desc && (
                                  <p className="text-xs text-yellow-600 line-clamp-2 mt-1">
                                    {Array.isArray(feature.desc)
                                      ? feature.desc[0].substring(0, 100) +
                                        (feature.desc[0].length > 100
                                          ? "..."
                                          : "")
                                      : feature.desc.substring(0, 100) +
                                        (feature.desc.length > 100
                                          ? "..."
                                          : "")}
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
    classFeatures: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          index: PropTypes.string,
          name: PropTypes.string,
          url: PropTypes.string,
          level: PropTypes.number,
        }),
      ])
    ),
    campaignID: PropTypes.string,
    selectedSpells: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        level: PropTypes.number.isRequired,
        school: PropTypes.oneOfType({
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
