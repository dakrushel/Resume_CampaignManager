import { useEffect, useState } from "react";
import { useAuthToken } from "./characterAPIs/useauthtoken";
import { fetchCharactersByCampaign } from "./characterAPIs/pcMongoAPIs";
import CharacterDisplay from "./characterdisplay";
import PropTypes from "prop-types";
import { normalizeCharacterSpells } from "../utils/spellNormalizer";

const CharacterList = ({ campaignID }) => {

  const token = useAuthToken();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCharacter, setExpandedCharacter] = useState(null);
  const [displayedCharacter, setDisplayedCharacter] = useState(null);

  const blankCharacter = {
    name: "",
    alignment: "",
    race: "",
    class: "",
    speed: 0,
    hitDice: "",
    hitPoints: {
      max: 0,
      current: 0,
      temporary: 0
    },
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
    level: 1,
    classFeatures: [],
    campaignID: campaignID,
  };

  const fetchCharacters = async () => {
    try {
      if (!campaignID || !token) return;
      setLoading(true);
      const data = await fetchCharactersByCampaign(campaignID, token);
      setCharacters(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.message.includes("404")) {
        console.log("No characters found for this campaign");
        setCharacters([]);
      } else {
        console.error("Error fetching characters:", err);
        setError("Failed to load characters.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, [campaignID, token]);

  const handleNewCharacter = () => {
    setDisplayedCharacter({
      ...blankCharacter,
      campaignID: campaignID,
    });
    setExpandedCharacter("new");
  };

  const handleCancel = () => {
    setExpandedCharacter(null);
    setDisplayedCharacter(null);
  };

  const refreshCharacters = async () => {
    try {
      const updatedCharacters = await fetchCharactersByCampaign(campaignID, token);
      setCharacters(updatedCharacters);
    } catch (error) {
      console.error("Failed to refresh characters:", error);
    }
  };

  return (
    <div className="p-4 bg-light-tan text-lg rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Player Characters</h2>

      {loading ? (
        <p className="text-brown">Loading characters...</p>
      ) : error ? (
        <p className="text-red-800">{error}</p>
      ) : characters.length === 0 ? (
        <p className="text-brown italic">
          No characters found for this campaign.
        </p>
      ) : (
        <ul className="divide-y divide-gray-300">
          {characters.map((char) => (
            <li key={char._id} className="py-2">
              <button
                onClick={() =>
                  setExpandedCharacter(
                    expandedCharacter === char._id ? null : char._id
                  )
                }
                className="w-full text-left font-semibold text-blue-600 hover:underline focus:outline-none"
              >
                {`${char.name}`} {expandedCharacter === char._id ? "▲" : "▼"}
              </button>
              {expandedCharacter === char._id && (
                <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                  <CharacterDisplay
                    character={char}
                    isNew={false}
                    onCancel={handleCancel}
                    refreshCharacters={refreshCharacters}
                    campaignID={campaignID}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {expandedCharacter === "new" && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <CharacterDisplay
            character={displayedCharacter || blankCharacter}
            isNew={true}
            onCancel={handleCancel}
            refreshCharacters={refreshCharacters}
            campaignID={campaignID}
          />
        </div>
      )}

      <button
        onClick={handleNewCharacter}
        className="mt-2 bg-goblin-green text-xl text-gold px-4 py-2 rounded-full shadow-sm shadow-amber-800"
      >
        +
      </button>
    </div>
  );
};

CharacterList.propTypes = {
  campaignID: PropTypes.string.isRequired,
};

export default CharacterList;