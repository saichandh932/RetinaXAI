export const REVIEW_QUEUE = [
  { id: 'SCR-20260909-045', phc: 'PHC Rajnagar', quality: 'GOOD', grade: 'Level 3', severity: 'Severe NPDR', referral: true, confidence: 88, priority: 'HIGH', status: 'PENDING', waiting: '52 min' },
  { id: 'SCR-20260909-041', phc: 'PHC Korba', quality: 'GOOD', grade: 'Level 4', severity: 'Prolif. DR', referral: true, confidence: 93, priority: 'HIGH', status: 'PENDING', waiting: '1h 24min' },
  { id: 'SCR-20260909-047', phc: 'PHC Bilaspur', quality: 'GOOD', grade: 'Level 2', severity: 'Moderate NPDR', referral: true, confidence: 91, priority: 'MEDIUM', status: 'PENDING', waiting: '18 min' },
  { id: 'SCR-20260909-039', phc: 'PHC Raigarh', quality: 'ACCEPTABLE', grade: 'Level 2', severity: 'Moderate NPDR', referral: true, confidence: 79, priority: 'MEDIUM', status: 'PENDING', waiting: '2h 05min' },
  { id: 'SCR-20260909-036', phc: 'PHC Ambikapur', quality: 'GOOD', grade: 'Level 3', severity: 'Severe NPDR', referral: true, confidence: 85, priority: 'HIGH', status: 'PENDING', waiting: '3h 12min' },
  { id: 'SCR-20260909-033', phc: 'PHC Jagdalpur', quality: 'GOOD', grade: 'Level 1', severity: 'Mild NPDR', referral: false, confidence: 87, priority: 'LOW', status: 'PENDING', waiting: '4h 01min' },
  { id: 'SCR-20260909-028', phc: 'PHC Durg', quality: 'GOOD', grade: 'Level 2', severity: 'Moderate NPDR', referral: true, confidence: 90, priority: 'MEDIUM', status: 'IN REVIEW', waiting: '5h 30min' },
]

export const REVIEW_QUEUE_IDS = new Set(REVIEW_QUEUE.map(row => row.id))

export function getReviewedQueueIds() {
  try {
    const reviewedIds = JSON.parse(localStorage.getItem('dr_reviewed_queue_ids') || '[]')
    return Array.isArray(reviewedIds) ? reviewedIds.filter(id => REVIEW_QUEUE_IDS.has(id)) : []
  } catch {
    return []
  }
}
