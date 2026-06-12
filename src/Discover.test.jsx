import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Discover from './pages/Discover';

describe('Discover Component', () => {
  it('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <Discover />
      </BrowserRouter>
    );
    expect(screen.getByText(/Loading community.../i)).toBeDefined();
  });
});
