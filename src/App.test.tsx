import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the landing page at root route', () => {
    render(<App />);
    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByText('Ericsson Nikola Tesla × Rimac Energy')).toBeInTheDocument();
  });
});
