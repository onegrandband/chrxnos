export const TIMER_MESSAGES = [
  "Time is up! Deep breath—your session is wrapped up with style.",
  "Mission accomplished! Step back and admire what you've just put in.",
  "Countdown hit zero. Time to transition or take a well-deserved breather.",
  "Ding! Another focused block locked in the books. Great rhythm!",
  "Target duration completed. Roll your shoulders and reset for the next move.",
  "Stopwatch says finish line! Take a sip of water and celebrate the momentum.",
  "Breathe out—your timer is complete. Mind clear, energy recharged.",
  "You did it! That session is in the bag. Ready for the next adventure?",
  "Time's arrived! Clean stop right on the dot. What's next on your horizon?",
  "Zero hour reached! High five to your discipline—now enjoy the payoff.",
];

export const STOPWATCH_MESSAGES = [
  "Milestone reached! You're cruising with exceptional pace and stamina.",
  "Checkpoint achieved! Steady pacing wins the entire distance.",
  "Clock alert: You've surpassed another benchmark—keep the rhythm going!",
  "Boom! Another split milestone locked down. Consistent and focused.",
  "Pacing reminder: You're right on target. Hold that steady cadence!",
  "Splits looking sharp! You've officially crossed into prime time.",
  "Checkpoint alert: Precision timing on point. Keep tracking strong.",
  "Target time touched down! Power and consistency shining through.",
  "Milestone unlocked! The stopwatch is proud of your relentless tempo.",
  "Time check passed! Excellent discipline—pushing the boundaries today.",
];

export const RECURRING_MESSAGES = [
  "Cadence alert: Drink a glass of water, uncross legs, and roll your shoulders.",
  "Gentle nudge: Look 20 feet into the distance for 20 seconds. Relax your eyes!",
  "Spine check: Align your neck over your shoulders and take two slow, deep breaths.",
  "Hydration station: Your brain is 75% water—give it a fresh sip of fuel.",
  "Posture reset: Drop your shoulders away from your ears and loosen your jaw.",
  "Movement break: Stand up, stretch those hip flexors, or take 20 quick steps.",
  "Mindful pause: Inhale for 4 seconds, hold for 4, and let out a full exhale.",
  "Digital eye rest: Soften your gaze, blink a few times, and let your eyes rest.",
  "Circulation boost: Shake out your wrists and hands, then adjust your posture.",
  "Wellness ping: Small habits build immense energy. You're doing fantastic!",
];

export function getRandomAlertMessage(type: 'timer' | 'stopwatch' | 'recurring'): string {
  const pool =
    type === 'timer'
      ? TIMER_MESSAGES
      : type === 'stopwatch'
      ? STOPWATCH_MESSAGES
      : RECURRING_MESSAGES;

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
