import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

import { TacticalMap, type TacticalHazard, type TacticalWaypoint } from '@/components/map/TacticalMap';
import * as flags from '@/lib/flags';
import * as logging from '@/lib/logging';

vi.mock('@react-google-maps/api', () => ({
  OverlayView: ({ children }: { children: ReactNode }) => <div data-testid="overlay">{children}</div>,
  Polygon: () => <div data-testid="polygon" />,
}));

vi.mock('@/components/map/GoogleMap', () => ({
  GoogleMap: ({ children }: { children: ReactNode }) => (
    <div data-testid="google-map">{children}</div>
  ),
}));

const createMapProps = () => ({
  customerAddress: '123 Test Ave',
  onAddressUpdate: vi.fn(),
  onAreaDrawn: vi.fn(),
  onCrackLengthDrawn: vi.fn(),
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('TacticalMap', () => {
  it('renders hazards when tactical enhancements flag is enabled', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((flag) => flag === 'tacticalMapV2');
    const logSpy = vi.spyOn(logging, 'logEvent').mockImplementation(() => {});

    const hazards: TacticalHazard[] = [
      { id: 'haz-1', coordinates: [37.1, -80.2], severity: 'high', label: 'High Heat' },
    ];

    render(
      <TacticalMap
        {...createMapProps()}
        hazards={hazards}
        zones={[]}
        waypoints={[]}
        showPulse={false}
      />,
    );

    expect(screen.getByText('High Heat')).toBeInTheDocument();
    expect(logSpy).toHaveBeenCalledWith(
      'tactical_map_render',
      expect.objectContaining({ hazardCount: 1 }),
    );
  });

  it('suppresses hazards when tactical enhancements flag is disabled', () => {
    vi.spyOn(flags, 'isEnabled').mockReturnValue(false);
    const logSpy = vi.spyOn(logging, 'logEvent').mockImplementation(() => {});

    render(
      <TacticalMap
        {...createMapProps()}
        hazards={[{ id: 'haz-1', coordinates: [0, 0], severity: 'low', label: 'Low Risk' }]}
        zones={[]}
        waypoints={[]}
      />,
    );

    expect(screen.queryByText('Low Risk')).not.toBeInTheDocument();
    expect(logSpy).not.toHaveBeenCalledWith(
      'tactical_map_render',
      expect.objectContaining({ hazardCount: 1 }),
    );
  });

  it('logs waypoint selection when enhancements are enabled', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((flag) => flag === 'tacticalMapV2');
    const logSpy = vi.spyOn(logging, 'logEvent').mockImplementation(() => {});

    const waypoint: TacticalWaypoint = {
      id: 'wp-1',
      coordinates: [35.2, -79.1],
      label: 'Staging',
      status: 'active',
    };

    render(
      <TacticalMap
        {...createMapProps()}
        waypoints={[waypoint]}
        hazards={[]}
        zones={[]}
        onWaypointSelect={vi.fn()}
      />,
    );

    const label = screen.getByText('Staging');
    fireEvent.click(label);

    expect(logSpy).toHaveBeenCalledWith(
      'tactical_map_waypoint_select',
      expect.objectContaining({ waypointId: waypoint.id, status: 'active' }),
    );
  });
});

