import { ref, watch, onMounted, type Ref } from "vue";
import { parseJSON } from "../utils/jsonUtils";

export default function useSessionStorage<T>(key: string, initialValue: T): Ref<T> {
	const storedValue = ref<T>(initialValue) as Ref<T>;

	// Load initial value from session storage
	onMounted(() => {
		const sessionData = sessionStorage.getItem(key);
		if (sessionData) {
			const parsedData = parseJSON<T>(sessionData);
			if (parsedData !== null) {
				storedValue.value = parsedData;
			}
		}
	});

	// Watch for changes and update session storage
	watch(
		storedValue,
		(newValue) => {
			sessionStorage.setItem(key, JSON.stringify(newValue));
		},
		{ deep: true }
	);

	return storedValue;
}
