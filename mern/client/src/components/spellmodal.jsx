import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { fetchClassSpells } from './characterAPIs/pc5eAPIs';

const SpellModal = ({ 
  level, 
  classIndex, 
  onAddSpell, 
  onClose, 
  remainingSpellPoints,
  selectedSpells,
  availableSpells
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [spells, setSpells] = useState([]);

  useEffect(() => {
    const loadSpells = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Filter available spells by level
        const spellsForLevel = availableSpells.filter(spell => spell.level === level);
        
        if (spellsForLevel.length === 0) {
          const apiSpells = await fetchClassSpells(classIndex);
          setSpells(apiSpells.filter(spell => spell.level === level));
        } else {
          setSpells(spellsForLevel);
        }
      } catch (err) {
        console.error("Error loading spells:", err);
        setError("Failed to load spells. Please try again.");
        setSpells([]);
      } finally {
        setLoading(false);
      }
    };

    loadSpells();
  }, [level, classIndex, availableSpells]);

  const isSpellSelected = (spellIndex) => {
    return selectedSpells.some(s => s.index === spellIndex);
  };

  const canAddSpell = (spell) => {
    if (level === 0) return true; // Cantrips don't consume slots
    if (isSpellSelected(spell.index)) return false;
    return remainingSpellPoints > 0;
  };

  if (!level) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">
              {level === 0 ? "Cantrips" : `Level ${level} Spells`}
            </h2>
            {level > 0 && (
              <p className={`text-sm ${
                remainingSpellPoints <= 0 ? 'text-red-500' : 'text-gray-600'
              }`}>
                Slots remaining: {remainingSpellPoints}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-500">
            {error}
          </div>
        ) : spells.length === 0 ? (
          <p className="text-center py-4">No spells available at this level.</p>
        ) : (
          <div className="overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {spells.map((spell) => {
                const canAdd = canAddSpell(spell);
                return (
                  <div key={spell.index} className="p-4 border rounded shadow hover:bg-gray-50">
                    <h3 className="font-bold">{spell.name}</h3>
                    <p className="text-sm text-gray-600">
                      {spell.school?.name || 'Unknown'} {level > 0 ? `(Level ${level})` : '(Cantrip)'}
                    </p>
                    <button
                      onClick={() => canAdd && onAddSpell(spell)}
                      disabled={!canAdd}
                      className={`mt-2 p-2 w-full rounded transition-colors ${
                        !canAdd
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {isSpellSelected(spell.index) 
                        ? 'Already Prepared' 
                        : level === 0 
                          ? 'Learn Cantrip' 
                          : 'Prepare Spell'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

SpellModal.propTypes = {
  level: PropTypes.number,
  classIndex: PropTypes.string,
  onAddSpell: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  remainingSpellPoints: PropTypes.number.isRequired,
  selectedSpells: PropTypes.arrayOf(PropTypes.object).isRequired,
  availableSpells: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default SpellModal;