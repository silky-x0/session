import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Hero } from './Hero';

// Wrap component with Router since SessionInput uses useNavigate
const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Hero', () => {
  it('renders the main heading text', () => {
    renderWithRouter(<Hero />);
    
    // Use getByRole for the h1 heading specifically
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/stop juggling tabs/i);
    expect(heading).toHaveTextContent(/your entire/i);
    expect(heading).toHaveTextContent(/session/i);
  });

  it('renders the description paragraph', () => {
    renderWithRouter(<Hero />);
    
    expect(
      screen.getByText(/ai-generated questions/i)
    ).toBeInTheDocument();
  });

  it('renders the session input component', () => {
    renderWithRouter(<Hero />);
    
    // Check for the input placeholder
    expect(
      screen.getByPlaceholderText(/Paste a prompt or start empty/i)
    ).toBeInTheDocument();
  });

  it('renders mode toggle buttons', () => {
    renderWithRouter(<Hero />);
    
    expect(screen.getByRole('button', { name: /start session/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join session/i })).toBeInTheDocument();
  });
});
