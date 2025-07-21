import { ref, watch, onMounted, type Ref } from "vue";
import { parseJSON } from "../utils/jsonUtils";

export default function useLocalStorage<T>(key: string, initialValue: T): Ref<T> {
	const storedValue = ref<T>(initialValue) as Ref<T>;

	// Load initial value from local storage
	onMounted(() => {
		const localData = localStorage.getItem(key);
		if (localData) {
			const parsedData = parseJSON<T>(localData);
			if (parsedData !== null) {
				storedValue.value = parsedData;
			}
		}
	});

	// Watch for changes and update local storage
	watch(
		storedValue,
		(newValue) => {
			localStorage.setItem(key, JSON.stringify(newValue));
		},
		{ deep: true }
	);

	return storedValue;
}
