import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { SessionInput } from './SessionInput';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('SessionInput', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders with Start Session mode by default', () => {
    renderWithRouter(<SessionInput />);
    
    expect(
      screen.getByPlaceholderText(/Paste a problem, snippet, or interview prompt/i)
    ).toBeInTheDocument();
  });

  it('switches to Join Session mode when button clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SessionInput />);
    
    await user.click(screen.getByRole('button', { name: /join session/i }));
    
    expect(screen.getByPlaceholderText(/Enter room ID/i)).toBeInTheDocument();
  });

  it('navigates to editor with room ID when joining', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SessionInput />);
    
    // Switch to join mode
    await user.click(screen.getByRole('button', { name: /join session/i }));
    
    // Type room ID
    const input = screen.getByPlaceholderText(/Enter room ID/i);
    await user.type(input, 'test-room');
    
    // Click submit button (the arrow button)
    const buttons = screen.getAllByRole('button');
    const submitButton = buttons[buttons.length - 1]; // Last button is submit
    await user.click(submitButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/editor?room=test-room');
  });

  it('generates random room ID when starting without prompt', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SessionInput />);
    
    // Click submit without entering anything
    const buttons = screen.getAllByRole('button');
    const submitButton = buttons[buttons.length - 1];
    await user.click(submitButton);
    
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/\/editor\?room=.+/));
  });
});
