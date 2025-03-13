describe('Login', () => {
    it('should log in successfully', () => {
      cy.visit('/login');
      cy.get('input[name="email"]').type('user@example.com');
      cy.get('input[name="password"]').type('password');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });
  });