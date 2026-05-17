export class AuthResponseDto<data> {
  data: data[];
  accessToken: string;
  accesTokenExpiresIn: number;
  refreshToken: string;
  refreshTokenExpiresIn: number;

  constructor(partial: Partial<AuthResponseDto<data>>) {
    Object.assign(this, partial);
  }
}
