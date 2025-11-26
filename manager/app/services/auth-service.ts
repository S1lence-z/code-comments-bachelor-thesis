import type { AuthResponseDto, LoginRequestDto } from "../../shared/types/authentication";

const useAuthService = () => {
	const serverLogin = async (
		password: string,
		backendBaseUrl: string
	): Promise<AuthResponseDto> => {
		// Prepare request
		const requestUrl = `${backendBaseUrl}/api/v1/auth/login`;
		const requestBody: LoginRequestDto = {
			password: password,
		};
		try {
			const response = await fetch(requestUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
			});
			const responseData: AuthResponseDto = await response.json();
			return responseData;
		} catch (error) {
			throw error;
		}
	};

	return {
		serverLogin,
	};
};

export default useAuthService;
