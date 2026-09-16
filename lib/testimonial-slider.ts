export type TestimonialDirection = -1 | 0 | 1;

export function getBoundedTestimonialIndex(current: number, direction: TestimonialDirection, count: number): number {
  if (count <= 0) return 0;
  return Math.min(Math.max(current + direction, 0), count - 1);
}

export function getSwipeDirection(deltaX: number, threshold = 40): TestimonialDirection {
  if (Math.abs(deltaX) < threshold) return 0;
  return deltaX > 0 ? -1 : 1;
}
