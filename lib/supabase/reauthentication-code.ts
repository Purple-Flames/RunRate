export const REAUTHENTICATION_CODE_LENGTH = 8

const reauthenticationCodePattern = new RegExp(`^\\d{${REAUTHENTICATION_CODE_LENGTH}}$`)

export function isValidReauthenticationCode(token: string) {
  return reauthenticationCodePattern.test(token)
}
