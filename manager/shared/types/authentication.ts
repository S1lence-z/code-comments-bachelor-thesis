export interface AuthResponseDto {
	success: boolean;
	message: string;
	token?: string;
}

export interface LoginRequestDto {
	password: string;
}
