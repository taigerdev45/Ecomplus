import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../app/page';

jest.mock('next/link', () => {
  // @ts-ignore
  return function MockLink({ children, href }) {
    return React.createElement('a', { href }, children);
  };
});

jest.mock('next/image', () => {
  // @ts-ignore
  return function MockImage({ src, alt }) {
    return React.createElement('img', { src, alt });
  };
});

// ── Mock fetch ─────────────────────────────────────────────────────────────────
beforeEach(() => {
  // @ts-ignore
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          success: true,
          data: { description_services: 'Test description' },
        }),
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});


describe('Home Page', () => {
  it('renders the hero section with the title', async () => {
    await act(async () => {
      render(<Home />);
    });
    const title = screen.getByText(/Simplifiez vos achats en/i);
    expect(title).toBeInTheDocument();
  });

  it('renders the call to action buttons', async () => {
    await act(async () => {
      render(<Home />);
    });
    const catalogueBtn = screen.getByText(/Explorer le catalogue/i);
    const trackingBtn = screen.getByText(/Suivre mon colis/i);
    expect(catalogueBtn).toBeInTheDocument();
    expect(trackingBtn).toBeInTheDocument();
  });
});
