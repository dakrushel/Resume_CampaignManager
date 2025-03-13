// dev-sbp6tvoggc1fmyxf .ca.auth0.com
// API Audience https://dev-sbp6tvoggc1fmyxf.ca.auth0.com/api/v2/
// Client ID: 89ridwQKPantJNGqQXHs3EpbrFXgPLa3
// Client Secret VmOP8Y2CvJ_ejjBIE18QwHj9SM7PPWIujhxMQErOkUMoHVIiG91Ln-gtPLFERgEW
// Domain dev-sbp6tvoggc1fmyxf.ca.auth0.com

let authToken;

before(() => {
  cy.request({
    method: 'POST',
    url: 'https://dev-sbp6tvoggc1fmyxf.ca.auth0.com/oauth/token', // Replace with your Auth0 domain
    body: {
      client_id: '89ridwQKPantJNGqQXHs3EpbrFXgPLa3',
      client_secret: 'VmOP8Y2CvJ_ejjBIE18QwHj9SM7PPWIujhxMQErOkUMoHVIiG91Ln-gtPLFERgEW',
      audience: 'https://dev-sbp6tvoggc1fmyxf.ca.auth0.com/api/v2/',
      grant_type: 'client_credentials'
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    authToken = response.body.access_token;
    cy.log(`Auth Token: ${authToken}`);
  });
});

describe('PC Route API Tests', () => {
  let createdPCId;

  it('should create a new player character', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:5050/api/pc',
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      body: {
        campaignID: 1,
        name: 'Arannis',
        alignment: 'Neutral Good',
        race: 'Elf',
        class: 'Rogue',
        speed: 30,
        hitDice: '1d8',
        proficiencies: ['Stealth', 'Acrobatics'],
        stats: {
          strength: 14,
          dexterity: 18,
          constitution: 12,
          intelligence: 10,
          wisdom: 13,
          charisma: 16
        },
        size: 'Medium',
        languages: ['Common', 'Elvish'],
        traits: ['Darkvision', 'Keen Senses'],
        startingProficiencies: ['Light Armor', 'Simple Weapons'],
        classProficiencies: ['Light Armor', 'Simple Weapons', 'Hand Crossbows']
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
      createdPCId = response.body._id;
      cy.log(`Created PC ID: ${createdPCId}`);
    });
  });

  it('should retrieve the created player character', () => {
    cy.request({
      method: 'GET',
      url: `http://localhost:5050/api/pc/${createdPCId}`,
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.name).to.eq('Arannis');
      expect(response.body.class).to.eq('Rogue');
    });
  });

  it('should update the player character', () => {
    cy.request({
      method: 'PUT',
      url: `http://localhost:5050/api/pc/${createdPCId}`,
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      body: {
        campaignID: 1,
        name: 'Arannis Updated',
        alignment: 'Chaotic Neutral',
        race: 'Elf',
        class: 'Rogue',
        speed: 35,
        hitDice: '1d8',
        proficiencies: ['Stealth', 'Acrobatics', 'Perception'],
        stats: {
          strength: 14,
          dexterity: 20,
          constitution: 12,
          intelligence: 10,
          wisdom: 13,
          charisma: 16
        },
        size: 'Medium',
        languages: ['Common', 'Elvish'],
        traits: ['Darkvision', 'Keen Senses'],
        startingProficiencies: ['Light Armor', 'Simple Weapons'],
        classProficiencies: ['Light Armor', 'Simple Weapons', 'Hand Crossbows']
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.message).to.eq('Player character updated successfully');
    });
  });

  it('should delete the player character', () => {
    cy.request({
      method: 'DELETE',
      url: `http://localhost:5050/api/pc/${createdPCId}`,
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
    });

    // Verify deletion
    cy.request({
      method: 'GET',
      url: `http://localhost:5050/api/pc/${createdPCId}`,
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      failOnStatusCode: false // Expect 404 after deletion
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
});
