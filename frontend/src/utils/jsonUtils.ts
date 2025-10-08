export const parseJSON = <T>(jsonString: string): T | null => {
	try {
		return JSON.parse(jsonString) as T;
	} catch (error) {
		console.error("Failed to parse JSON:", error);
		return null;
	}
};

export const downloadJSON = (data: any, filename: string) => {
	const blob = new Blob([JSON.stringify(data, null, 2)], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
};

export const objectDeepCopy = <T>(obj: T): T => {
	return JSON.parse(JSON.stringify(obj));
};
