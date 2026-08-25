export const CHART_PALETTE = ['#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#EF4444'];

export function colorForIndex(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length];
}
