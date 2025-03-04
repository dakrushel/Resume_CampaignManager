import { useEffect, useState } from "react";
import { useAuthToken } from "./characterAPIs/useauthtoken";
import { fetchCharactersByCampaign } from "./characterAPIs/pcMongoAPIs";
import CharacterDisplay from "./characterdisplay";
import PropTypes from "prop-types";

const CharacterList = ({ campaignID }) => {
    const token = useAuthToken(); // Get Auth0 token
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedCharacter, setExpandedCharacter] = useState(null);

    useEffect(() => {
        if (!campaignID || !token) return; // Wait for token before fetching

        const loadCharacters = async () => {
            try {
                setLoading(true);
                const data = await fetchCharactersByCampaign(campaignID, token);
                setCharacters(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching characters:", err);
                setError("Failed to load characters.");
            } finally {
                setLoading(false);
            }
        };

        loadCharacters();
    }, [campaignID, token]); // Fetch when campaignID or token changes

    const toggleCharacter = (characterId) => {
        setExpandedCharacter(expandedCharacter === characterId ? null : characterId);
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">Player Characters</h2>

            {loading ? (
                <p className="text-gray-600">Loading characters...</p>
            ) : error ? (
                <p className="text-red-600">{error}</p>
            ) : characters.length === 0 ? (
                <p className="text-gray-600 italic">No characters found for this campaign.</p>
            ) : (
                <ul className="divide-y divide-gray-300">
                    {characters.map((char) => (
                        <li key={char._id} className="py-2">
                            <button
                                onClick={() => toggleCharacter(char._id)}
                                className="w-full text-left font-semibold text-blue-600 hover:underline focus:outline-none"
                            >
                                {`${char.name} ${char._id}`} {expandedCharacter === char._id ? "▲" : "▼"}
                            </button>

                            {expandedCharacter === char._id && (
                                <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                                    {/* {console.log("characterlist - character: ", char)} */}
                                    <CharacterDisplay character={char} />
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

CharacterList.propTypes = {
    campaignID: PropTypes.string.isRequired,
};

export default CharacterList;
