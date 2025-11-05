import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

vi.mock('leaflet', () => {
  const fitBounds = vi.fn();
  const mockMap = {
    setView: vi.fn().mockReturnThis(),
    fitBounds,
  };
  const mockLayerGroup = {
    addTo: vi.fn().mockReturnThis(),
    clearLayers: vi.fn(),
  };
  const circleMarker = vi.fn(() => ({
    addTo: vi.fn().mockReturnValue({ bindPopup: vi.fn() }),
  }));
  return {
    map: vi.fn(() => mockMap),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    circleMarker,
    LayerGroup: vi.fn(() => mockLayerGroup),
    latLngBounds: vi.fn(() => ({ pad: vi.fn(() => ({})) })),
  };
});

const refetch = vi.fn();

vi.mock('@/modules/mission-control/division-map/useDivisionMapData', () => ({
  useDivisionMapData: () => ({
    data: {
      points: [
        {
          id: 'job-1',
          name: 'Mission Alpha',
          status: 'need_estimate',
          coordinates: [36.1, -79.5],
          quoteValue: 125000,
          totalAreaSqFt: 42000,
        },
        {
          id: 'job-2',
          name: 'Mission Bravo',
          status: 'completed',
          coordinates: [36.4, -79.9],
          quoteValue: 98000,
          totalAreaSqFt: 28000,
        },
      ],
      statusCounts: {
        need_estimate: 1,
        completed: 1,
      },
      totalQuoteValue: 223000,
      totalAreaSqFt: 70000,
      center: [36.2, -79.7],
    },
    isLoading: false,
    isError: false,
    refetch,
  }),
}));

import { DivisionMapInterface } from '@/modules/mission-control/division-map/DivisionMapInterface';

describe('DivisionMapInterface', () => {
  it('renders summary metrics and toggles', () => {
    render(<DivisionMapInterface />);

    expect(screen.getByText(/Mission Footprint/i)).toBeInTheDocument();
    expect(screen.getByText(/Quote Pipeline/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /need estimate/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /completed/i })).toBeInTheDocument();
  });

  it('invokes refetch when refresh button is clicked', async () => {
    const user = userEvent.setup();
    render(<DivisionMapInterface />);

    await user.click(screen.getByRole('button', { name: /refresh/i }));
    expect(refetch).toHaveBeenCalled();
  });
});
