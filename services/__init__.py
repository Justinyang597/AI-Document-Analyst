from typing import Iterable, List, Dict, Any

def normalize_history(history: Iterable) -> List[Dict[str, Any]]:
	"""Ensure history is a list of message dicts with `role` and `content`.

	Accepts legacy or malformed entries (strings) and converts them into
	assistant messages so service code can safely call `.get` on items.
	"""
	out: List[Dict[str, Any]] = []
	if not history:
		return out

	for item in history:
		if isinstance(item, dict):
			role = item.get("role")
			content = item.get("content", "")
		else:
			# Treat bare strings as assistant content
			role = "assistant"
			content = str(item)

		if role in ("user", "assistant") and content:
			out.append({"role": role, "content": content})

	return out
