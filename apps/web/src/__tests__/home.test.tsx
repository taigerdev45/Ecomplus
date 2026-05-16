import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../app/page';

// ── Mocks Next.js ──────────────────────────────────────────────────────────────
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

jest.mock('next/image', () => {
  const MockImage = ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  );
  MockImage.displayName = 'MockImage';
  return MockImage;
});

// ── Mock fetch ─────────────────────────────────────────────────────────────────
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          success: true,
          data: { description_services: 'Test description' },
        }),
    })
  ) as jest.Mock;
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
