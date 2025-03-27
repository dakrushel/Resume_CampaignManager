import { useEffect, useState } from "react";
import { useAuthToken } from "./characterAPIs/useauthtoken";
import { fetchCharactersByCampaign } from "./characterAPIs/pcMongoAPIs";
import CharacterDisplay from "./characterdisplay";
import PropTypes from "prop-types";
import { normalizeCharacterSpells } from "../utils/spellNormalizer";

const CharacterList = ({ campaignID }) => {
  const token = useAuthToken(); // Get Auth0 token
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCharacter, setExpandedCharacter] = useState(null);

  const blankCharacter = {
    _id: 'new',
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
    level: 1,
    classFeatures: [],
  };

  const fetchCharacters = async () => {
    try {
      if (!campaignID || !token) return;
      const data = await fetchCharactersByCampaign(campaignID, token);
      setCharacters(
        Array.isArray(data) ? data.map(normalizeCharacterSpells) : []
      );
    } catch (err) {
      console.error("Error fetching characters:", err);
      setError("Failed to load characters.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // if (!campaignID || !token) return; // Wait for token before fetching

    // const loadCharacters = async () => {
    //     try {
    //         setLoading(true);
    //         const data = await fetchCharactersByCampaign(campaignID, token);
    //         setCharacters(Array.isArray(data) ? data : []);
    //     } catch (err) {
    //         console.error("Error fetching characters:", err);
    //         setError("Failed to load characters.");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    fetchCharacters();
  }, [campaignID, token]); // Fetch when campaignID or token changes

  // const toggleCharacter = (characterId) => {
  //     setExpandedCharacter(expandedCharacter === characterId ? null : characterId);
  // };

  const handleCancel = () => {
    setExpandedCharacter(null);
  };

  const refreshCharacters = () => {
    fetchCharacters();
  };

                          
  return (
    <div className="p-4 bg-light-tan text-lg rounded-lg">
      {/* <h2 className="text-lg font-semibold mb-2">Player Characters</h2> */}

      {loading ? (
        <p className="text-brown">Loading characters...</p>
      ) : error ? (
        <p className="text-red-800">{error}</p>
      ) : characters.length === 0 ? (
        <p className="text-brown italic">
          No characters found for this campaign.
        </p>
      ) : (
        <ul className="divide-y divide-amber-950">
          {characters.map((char) => (
            <li key={char._id} className="py-2">
              <button
                onClick={() =>
                  setExpandedCharacter(
                    expandedCharacter === char._id ? null : char._id
                  )
                }
                className="w-full text-left font-semibold hover:underline focus:outline-none"
              >
                {`${char.name}`} {expandedCharacter === char._id ? "▲" : "▼"}
              </button>

              {expandedCharacter === char._id && (
                <div className="mt-2 rounded-lg">
                  {/* {console.log("characterlist - character: ", char)} */}
                  <CharacterDisplay
                    character={char}
                    onCancel={() => setExpandedCharacter(null)}
                    refreshCharacters={refreshCharacters}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {expandedCharacter === "new" && (
        <div className="mt-2 rounded-lg">
          <CharacterDisplay
            character={blankCharacter}
            isNew={true}
            onCancel={handleCancel}
          />
        </div>
      )}

      <button
        onClick={() => setExpandedCharacter("new")}
        className="mt-2 button bg-goblin-green text-xl text-gold px-4 py-2 rounded-full shadow-sm shadow-amber-800"
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
