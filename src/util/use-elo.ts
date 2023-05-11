const K = 40

export function useElo() {
  function getRatingDelta(
    homeRating: number,
    awayRating: number,
    gameResult: 0 | 1
  ) {
    const winChance =
      1 / (1 + Math.pow(10, (awayRating - homeRating) / 400));

    return Math.round(K * (gameResult - winChance));
  }

  function calculate(homeRating: number, awayRating: number, gameResult: 0 | 1) {
    return homeRating + getRatingDelta(homeRating, awayRating, gameResult);
  }

  return {
    calculate,
    getRatingDelta,
  };
}
