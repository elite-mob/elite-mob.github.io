const VISIT_RECORDED_KEY = 'site_visit_recorded';

export function shouldRecordVisit(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return !sessionStorage.getItem(VISIT_RECORDED_KEY);
  } catch {
    return false;
  }
}

export function markVisitRecorded(): void {
  try {
    sessionStorage.setItem(VISIT_RECORDED_KEY, '1');
  } catch {
    // ignore
  }
}

export function recordVisit(): void {
  if (!shouldRecordVisit()) return;

  void import('@/integrations/firebase/visitStatsFirestore')
    .then(({ recordVisitToFirestore }) => recordVisitToFirestore())
    .finally(() => {
      markVisitRecorded();
    });
}
