export const config = {
  port: Number(process.env.PORT ?? 3000),
  // Demotilan siemendata elää satovuodessa 2026; API:n päätepisteet käyttävät
  // sitä oletuksena, kun ?vuosi=-parametria ei anneta.
  oletusSatovuosi: 2026,
} as const;
