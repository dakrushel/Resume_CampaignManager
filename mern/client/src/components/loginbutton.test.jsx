import { render, screen } from '@testing-library/react';
import LoginButton from './components/LoginButton.jsx';

test('renders login button', () => {
  render(<LoginButton />);
  const buttonElement = screen.getByText(/Login/i);
  expect(buttonElement).toBeInTheDocument();
});