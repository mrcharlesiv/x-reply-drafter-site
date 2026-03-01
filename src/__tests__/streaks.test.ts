import { calculateStreakUpdate, getStreakDisplay, toDateString } from '../lib/streaks';

describe('calculateStreakUpdate', () => {
  const today = new Date('2026-03-01T12:00:00Z');

  it('should start a new streak for first-time user', () => {
    const result = calculateStreakUpdate(0, 0, null, false, null, today);
    expect(result.newStreak).toBe(1);
    expect(result.newLongest).toBe(1);
    expect(result.status).toBe('active');
  });

  it('should not change streak if already active today', () => {
    const result = calculateStreakUpdate(5, 10, '2026-03-01', false, null, today);
    expect(result.newStreak).toBe(5);
    expect(result.newLongest).toBe(10);
    expect(result.status).toBe('active');
  });

  it('should increment streak for consecutive day', () => {
    const result = calculateStreakUpdate(5, 10, '2026-02-28', false, null, today);
    expect(result.newStreak).toBe(6);
    expect(result.newLongest).toBe(10);
    expect(result.status).toBe('active');
  });

  it('should update longest streak when current exceeds it', () => {
    const result = calculateStreakUpdate(10, 10, '2026-02-28', false, null, today);
    expect(result.newStreak).toBe(11);
    expect(result.newLongest).toBe(11);
  });

  it('should reset streak after 2+ day gap', () => {
    const result = calculateStreakUpdate(15, 20, '2026-02-27', false, null, today);
    expect(result.newStreak).toBe(1);
    expect(result.newLongest).toBe(20);
    expect(result.status).toBe('broken');
  });

  it('should use streak freeze for 2-day gap when available', () => {
    const result = calculateStreakUpdate(15, 20, '2026-02-27', true, null, today);
    expect(result.newStreak).toBe(16);
    expect(result.newLongest).toBe(20);
    expect(result.streakFreezeUsed).toBe(true);
    expect(result.status).toBe('active');
  });

  it('should not use streak freeze if already used this month', () => {
    const result = calculateStreakUpdate(15, 20, '2026-02-27', true, '2026-03-01', today);
    expect(result.newStreak).toBe(1);
    expect(result.newLongest).toBe(20);
    expect(result.streakFreezeUsed).toBe(false);
    expect(result.status).toBe('broken');
  });

  it('should reset streak for long absence (7+ days)', () => {
    const result = calculateStreakUpdate(100, 100, '2026-02-20', false, null, today);
    expect(result.newStreak).toBe(1);
    expect(result.newLongest).toBe(100);
    expect(result.status).toBe('broken');
  });

  it('should not use streak freeze for 3+ day gap', () => {
    const result = calculateStreakUpdate(5, 10, '2026-02-26', true, null, today);
    expect(result.newStreak).toBe(1);
    expect(result.newLongest).toBe(10);
    expect(result.streakFreezeUsed).toBe(false);
    expect(result.status).toBe('broken');
  });
});

describe('getStreakDisplay', () => {
  it('should return correct display for 0 streak', () => {
    const { emoji, message } = getStreakDisplay(0);
    expect(emoji).toBe('💤');
    expect(message).toContain('Start');
  });

  it('should return fire emoji for low streaks', () => {
    const { emoji } = getStreakDisplay(3);
    expect(emoji).toBe('🔥');
  });

  it('should return double fire for 7+ days', () => {
    const { emoji } = getStreakDisplay(7);
    expect(emoji).toBe('🔥🔥');
  });

  it('should return triple fire for 14+ days', () => {
    const { emoji } = getStreakDisplay(14);
    expect(emoji).toBe('🔥🔥🔥');
  });

  it('should return diamond for 30+ days', () => {
    const { emoji } = getStreakDisplay(30);
    expect(emoji).toBe('💎');
  });

  it('should return trophy for 100+ days', () => {
    const { emoji } = getStreakDisplay(100);
    expect(emoji).toBe('🏆');
  });
});

describe('toDateString', () => {
  it('should format date as YYYY-MM-DD', () => {
    const date = new Date('2026-03-01T15:30:00Z');
    expect(toDateString(date)).toBe('2026-03-01');
  });
});
