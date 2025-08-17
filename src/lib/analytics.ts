export type AnalyticsEvent = {
	name: string;
	properties?: Record<string, any>;
};

export async function logEvent(event: AnalyticsEvent) {
	try {
		const apiUrl = import.meta.env.VITE_API_URL || '';
		if (!apiUrl) {
			localStorage.setItem(`fg_evt_${Date.now()}`, JSON.stringify(event));
			return;
		}
		await fetch(`${apiUrl}/api/analytics`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ...event, ts: new Date().toISOString() })
		});
	} catch (e) {
		// store locally if backend not available
		localStorage.setItem(`fg_evt_${Date.now()}`, JSON.stringify(event));
	}
}