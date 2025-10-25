  export const getStartAndEndUTC = (dayOffset = 0): { start: string; end: string } => {
    const now = new Date();

    const targetDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + dayOffset, 0, 0, 0, 0)
    );

    const start = new Date(targetDate);
    const end = new Date(targetDate);
    end.setUTCHours(23, 59, 59, 999);

    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  };