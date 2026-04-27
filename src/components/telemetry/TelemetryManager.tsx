'use client';

import { useTimeOnPage } from '@/hooks/useTimeOnPage';
import { useRageClickTracker } from '@/hooks/useRageClickTracker';
import { useOmniscientMatrix } from '@/hooks/useOmniscientMatrix';

/**
 * 🛰️ TelemetryManager Component
 * Centralized client-side component to initialize global telemetry sensors.
 * Included in RootLayout.
 */
export function TelemetryManager() {
    // Initialize Global Sensors
    useTimeOnPage();
    useRageClickTracker();
    useOmniscientMatrix();

    return null; // Silent component
}
