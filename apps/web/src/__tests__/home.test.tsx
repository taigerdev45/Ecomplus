import { render, screen } from '@testing-library/react';
import Home from '../app/page';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true, data: { description_services: 'Test description' } }),
  })
) as jest.Mock;

describe('Home Page', () => {
  it('renders the hero section with the title', () => {
    render(<Home />);
    const title = screen.getByText(/Simplifiez vos achats en/i);
    expect(title).toBeInTheDocument();
  });

  it('renders the call to action buttons', () => {
    render(<Home />);
    const catalogueBtn = screen.getByText(/Explorer le catalogue/i);
    const trackingBtn = screen.getByText(/Suivre mon colis/i);
    expect(catalogueBtn).toBeInTheDocument();
    expect(trackingBtn).toBeInTheDocument();
  });
});
