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
  "Stopwatch lap captured! You're cruising with exceptional pace and stamina.",
  "Stopwatch split marked! Steady pacing wins the entire distance.",
  "Precision split recorded—keep the rhythm going!",
  "Split locked down! Consistent, focused, and steady.",
  "Clock check: Pacing looking sharp on this split.",
  "Lap logged! Timing on point.",
  "Split captured: Relentless tempo in action.",
  "Timing confirmed! Precision data recorded.",
  "Lap split tracked! High performance output.",
  "Split milestone saved! Pushing the boundary today.",
];

export const REMINDER_MESSAGES = [
  "Friendly reminder! Time to attend to your scheduled task.",
  "Ding! Here is your scheduled reminder. You're right on track.",
  "Reminder ping: Take a pause and check this item off your list.",
  "Scheduled checkpoint arrived! Keep your flow going smoothly.",
  "Your reminder has arrived: Stay mindful and take action.",
  "Attention: Scheduled reminder ready for you. Great time management!",
  "Ping! Here's that reminder you set earlier. Let's make it happen.",
  "Gentle chime: Time for your upcoming task or check-in.",
  "Reminder reached! One step at a time keeps productivity high.",
  "Here is your alert! Clear your head and take care of this now.",
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

export function getRandomAlertMessage(type: 'timer' | 'stopwatch' | 'reminder' | 'recurring'): string {
  const pool =
    type === 'timer'
      ? TIMER_MESSAGES
      : type === 'stopwatch'
      ? STOPWATCH_MESSAGES
      : type === 'reminder'
      ? REMINDER_MESSAGES
      : RECURRING_MESSAGES;

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
