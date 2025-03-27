export const normalizeSpell = (spell) => {
    return {
      ...spell,
      school: typeof spell.school === 'string' 
        ? { name: spell.school }
        : spell.school || { name: 'Unknown' }
    };
  };
  
  export const normalizeCharacterSpells = (character) => {
    if (!character.selectedSpells) return character;
    
    return {
      ...character,
      selectedSpells: character.selectedSpells.map(normalizeSpell)
    };
  };