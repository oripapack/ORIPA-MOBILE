import { useEffect } from 'react';
import { useCoachStore } from '../../store/coachStore';

export function CoachHydration() {
  const hydrate = useCoachStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return null;
}
