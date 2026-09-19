export const AVATAR_MAP: Record<string, string> = {
  Alex: '/assets/avatars/Alex_Moore.png',
  Arturo: '/assets/avatars/Arturo_Montes_Hernandez.png',
  Arvid: '/assets/avatars/Arvid_Lorenz.png',
  Finley: '/assets/avatars/Finley_Charlier.png',
  Jakob: '/assets/avatars/Jakob_Merkle.png',
  Lasse: '/assets/avatars/Lasse_Schmidt.png',
  Lennox: '/assets/avatars/Lennox_Niemann.png',
  Levi: '/assets/avatars/Levi_Petko.png',
  Lion: '/assets/avatars/Lion_Macak.png',
  Lionel: '/assets/avatars/Lionel.png',
  Milan: '/assets/avatars/Milan_Wekiaroglou.png',
  Paul: '/assets/avatars/Paul_Miethe.png',
  Peter: '/assets/avatars/Peter_Grelle.png',
  Silas: '/assets/avatars/Silas_Aldenhoff.png',
  Tayo: '/assets/avatars/Tayo_Mohammed.png',
  Tommy: '/assets/avatars/Tommy.png',
};

export function getPlayerAvatar(playerName: string, customAvatar?: string): string | null {
  if (customAvatar) return customAvatar;
  if (!playerName) return null;

  const firstName = playerName.trim().split(' ')[0];
  if (AVATAR_MAP[firstName]) return AVATAR_MAP[firstName];
  if (AVATAR_MAP[playerName]) return AVATAR_MAP[playerName];

  const lowerFirst = firstName.toLowerCase();
  for (const [key, path] of Object.entries(AVATAR_MAP)) {
    if (key.toLowerCase() === lowerFirst) return path;
  }

  return null;
}
