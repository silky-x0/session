import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import {
  QuestionSidebar,
  type QuestionSlot,
} from './QuestionSidebar';

const mixedQuestions: QuestionSlot[] = [
  {
    status: 'ready',
    title: 'Two Sum',
    difficulty: 'Easy',
    question: 'Find two numbers that add up to target.',
    hints: ['Try a hash map'],
    fullSolution: 'function twoSum() {}',
  },
  { status: 'generating' },
  { status: 'pending' },
  { status: 'error' },
  {
    status: 'ready',
    title: 'Three Sum',
    difficulty: 'Medium',
    question: 'Find triplets that sum to zero.',
  },
];

const emptyPresence = new Map();

describe('QuestionSidebar', () => {
  it('renders nothing for legacy single-question rooms', () => {
    const { container } = render(
      <QuestionSidebar
        questions={[]}
        activeIndex={0}
        onSelect={() => {}}
        presenceByQuestion={emptyPresence}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders ready titles with a ready count', () => {
    render(
      <QuestionSidebar
        questions={mixedQuestions}
        activeIndex={0}
        onSelect={() => {}}
        presenceByQuestion={emptyPresence}
      />,
    );
    expect(screen.getByText('Two Sum')).toBeInTheDocument();
    expect(screen.getByText('Three Sum')).toBeInTheDocument();
    expect(screen.getByText('2/5')).toBeInTheDocument();
  });

  it('calls onSelect when a ready row is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <QuestionSidebar
        questions={mixedQuestions}
        activeIndex={0}
        onSelect={onSelect}
        presenceByQuestion={emptyPresence}
      />,
    );
    await user.click(screen.getByRole('button', { name: /switch to question 5/i }));
    expect(onSelect).toHaveBeenCalledWith(4);
  });

  it('does not call onSelect for pending or generating rows', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <QuestionSidebar
        questions={mixedQuestions}
        activeIndex={0}
        onSelect={onSelect}
        presenceByQuestion={emptyPresence}
      />,
    );
    // Pending / generating rows render as non-clickable skeletons
    expect(screen.getByLabelText(/Q2 generating/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Q3 pending/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /switch to question [23]/i }),
    ).toBeNull();
    expect(onSelect).not.toHaveBeenCalled();
    void user;
  });

  it('shows a retry button for error slots', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <QuestionSidebar
        questions={mixedQuestions}
        activeIndex={0}
        onSelect={() => {}}
        presenceByQuestion={emptyPresence}
        onRetry={onRetry}
      />,
    );
    await user.click(screen.getByRole('button', { name: /retry generating question 4/i }));
    expect(onRetry).toHaveBeenCalledWith(3);
  });

  it('renders avatar dots for collaborators on a question', () => {
    const presence = new Map([
      [0, [{ name: 'Alice', color: '#ff0000' }]],
    ]);
    render(
      <QuestionSidebar
        questions={mixedQuestions}
        activeIndex={0}
        onSelect={() => {}}
        presenceByQuestion={presence}
      />,
    );
    expect(screen.getByTitle('Alice')).toBeInTheDocument();
  });
});
