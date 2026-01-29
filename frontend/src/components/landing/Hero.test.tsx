import { render, screen } from '@testing-library/react';
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
    expect(heading).toHaveTextContent(/real-time/i);
    expect(heading).toHaveTextContent(/coding/i);
    expect(heading).toHaveTextContent(/session/i);
    expect(heading).toHaveTextContent(/that matter/i);
  });

  it('renders the description paragraph', () => {
    renderWithRouter(<Hero />);
    
    expect(
      screen.getByText(/Session is a real-time collaborative coding environment/i)
    ).toBeInTheDocument();
  });

  it('renders the session input component', () => {
    renderWithRouter(<Hero />);
    
    // Check for the input placeholder
    expect(
      screen.getByPlaceholderText(/Paste a problem, snippet, or interview prompt/i)
    ).toBeInTheDocument();
  });

  it('renders mode toggle buttons', () => {
    renderWithRouter(<Hero />);
    
    expect(screen.getByRole('button', { name: /start session/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join session/i })).toBeInTheDocument();
  });
});
