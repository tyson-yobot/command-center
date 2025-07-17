export function getContext(liveMode: boolean) {
  const userEmail = liveMode ? 'tyson@yobot.bot' : 'daniel@yobot.bot';
  const leadId = liveMode ? 'recD9aF6vqpUOCnA4' : 'recDbWmthkHtNZkld';
  const mode = liveMode ? 'LIVE' : 'TEST';
  return { userEmail, leadId, mode };
}
