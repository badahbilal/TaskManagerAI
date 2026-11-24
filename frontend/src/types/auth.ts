export interface UserDto {
  id: number;
  fullName: string;
  email: string;
}

export interface RegisterRequestDto {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  user: UserDto;
}
