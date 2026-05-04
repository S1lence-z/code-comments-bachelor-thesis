export const matchShortcut = (event: KeyboardEvent, binding: string): boolean => {
	if (!binding) return false;

	const parts = binding.split("-");
	const key = parts.pop()!.toLowerCase();

	const modifiers = parts.map((p) => p.toLowerCase());
	const needsCtrl = modifiers.includes("ctrl") || modifiers.includes("mod");
	const needsShift = modifiers.includes("shift");
	const needsAlt = modifiers.includes("alt");

	return (
		event.ctrlKey === needsCtrl &&
		event.shiftKey === needsShift &&
		event.altKey === needsAlt &&
		event.key.toLowerCase() === key
	);
};
