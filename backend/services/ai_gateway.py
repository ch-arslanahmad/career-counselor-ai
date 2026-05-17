from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

load_dotenv()


DEFAULT_OPENAI_ENDPOINT = "https://api.openai.com/v1"
DEFAULT_ANTHROPIC_ENDPOINT = "https://api.anthropic.com"
OPENCODE_AUTH_PATH = Path.home() / ".local/share/opencode/auth.json"


@dataclass(frozen=True)
class AIProviderConfig:
    provider_id: str
    provider_type: str
    api_key: str
    api_endpoint: str
    model: str
    source: str


class AIGatewayError(RuntimeError):
    pass


def _read_json(path: Path) -> Any:
    try:
        with path.open("r", encoding="utf-8") as file:
            return json.load(file)
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return None


def _expand_endpoint(value: str | None, fallback: str) -> str:
    if not value:
        return fallback
    if value.startswith("$"):
        return os.getenv(value[1:], fallback)
    return value


def _expand_secret(value: str | None) -> str:
    if not value:
        return ""
    stripped = value.strip()
    if stripped.startswith("$"):
        return os.getenv(stripped[1:], "").strip()
    return stripped


def _from_env() -> AIProviderConfig | None:
    provider_id = os.getenv("AI_PROVIDER", "").strip().lower()

    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    anthropic_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    openrouter_key = os.getenv("OPENROUTER_API_KEY", "").strip()
    opencode_zen_key = os.getenv("OPENCODE_ZEN_API_KEY", "").strip()

    if provider_id == "opencode-zen" and opencode_zen_key:
        return AIProviderConfig(
            provider_id="opencode-zen",
            provider_type="openai-compat",
            api_key=opencode_zen_key,
            api_endpoint=os.getenv("OPENCODE_ZEN_API_ENDPOINT", "https://opencode.ai/zen/v1"),
            model=os.getenv("OPENCODE_ZEN_MODEL", os.getenv("AI_MODEL", "big-pickle")),
            source="env",
        )

    if provider_id == "openrouter" and openrouter_key:
        return AIProviderConfig(
            provider_id="openrouter",
            provider_type="openai-compat",
            api_key=openrouter_key,
            api_endpoint=os.getenv("OPENROUTER_API_ENDPOINT", "https://openrouter.ai/api/v1"),
            model=os.getenv("OPENROUTER_MODEL", os.getenv("AI_MODEL", "openai/gpt-3.5-turbo")),
            source="env",
        )

    if provider_id == "anthropic" and anthropic_key:
        return AIProviderConfig(
            provider_id="anthropic",
            provider_type="anthropic",
            api_key=anthropic_key,
            api_endpoint=os.getenv("ANTHROPIC_API_ENDPOINT", DEFAULT_ANTHROPIC_ENDPOINT),
            model=os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001"),
            source="env",
        )

    if provider_id in {"openai", ""} and openai_key:
        return AIProviderConfig(
            provider_id="openai",
            provider_type="openai",
            api_key=openai_key,
            api_endpoint=os.getenv("OPENAI_API_ENDPOINT", DEFAULT_OPENAI_ENDPOINT),
            model=os.getenv("OPENAI_MODEL", "gpt-5.4-nano"),
            source="env",
        )

    return None


def _get_all_available_providers() -> list[AIProviderConfig]:
    """Return list of all providers with valid API keys, ordered by speed (fastest first)."""
    providers = []
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    anthropic_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    openrouter_key = os.getenv("OPENROUTER_API_KEY", "").strip()
    opencode_zen_key = os.getenv("OPENCODE_ZEN_API_KEY", "").strip()
    nvidia_nim_key = os.getenv("NVIDIA_NIM_API_KEY", "").strip()

    # Fast models first (small/fast models)
    if opencode_zen_key:
        providers.append(AIProviderConfig(
            provider_id="opencode-zen",
            provider_type="openai-compat",
            api_key=opencode_zen_key,
            api_endpoint=os.getenv("OPENCODE_ZEN_API_ENDPOINT", "https://opencode.ai/zen/v1"),
            model=os.getenv("OPENCODE_ZEN_MODEL", os.getenv("AI_MODEL", "big-pickle")),
            source="env",
        ))

    if openrouter_key:
        # Try fast models first via OpenRouter
        fast_model = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.1-8b-instruct")
        providers.append(AIProviderConfig(
            provider_id="openrouter",
            provider_type="openai-compat",
            api_key=openrouter_key,
            api_endpoint=os.getenv("OPENROUTER_API_ENDPOINT", "https://openrouter.ai/api/v1"),
            model=fast_model,
            source="env",
        ))

    if openai_key:
        providers.append(AIProviderConfig(
            provider_id="openai",
            provider_type="openai",
            api_key=openai_key,
            api_endpoint=os.getenv("OPENAI_API_ENDPOINT", DEFAULT_OPENAI_ENDPOINT),
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            source="env",
        ))

    # Slower large models
    if nvidia_nim_key:
        providers.append(AIProviderConfig(
            provider_id="nvidia-nim",
            provider_type="openai-compat",
            api_key=nvidia_nim_key,
            api_endpoint=os.getenv("NVIDIA_NIM_API_ENDPOINT", "https://integrate.api.nvidia.com/v1"),
            model=os.getenv("NVIDIA_NIM_MODEL", "nvidia/llama-3.1-nemotron-70b-instruct"),
            source="env",
        ))

    if anthropic_key:
        providers.append(AIProviderConfig(
            provider_id="anthropic",
            provider_type="anthropic",
            api_key=anthropic_key,
            api_endpoint=os.getenv("ANTHROPIC_API_ENDPOINT", DEFAULT_ANTHROPIC_ENDPOINT),
            model=os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001"),
            source="env",
        ))

    return providers


def _from_opencode() -> AIProviderConfig | None:
    auth = _read_json(OPENCODE_AUTH_PATH)
    if not isinstance(auth, dict):
        return None

    # Try to configure for OpenRouter
    openrouter = auth.get("openrouter")
    if isinstance(openrouter, dict):
        api_key = str(openrouter.get("key") or "").strip()
        if api_key:
            return AIProviderConfig(
                provider_id="openrouter",
                provider_type="openai-compat",
                api_key=api_key,
                api_endpoint=os.getenv("OPENROUTER_API_ENDPOINT", "https://openrouter.ai/api/v1"),
                model=os.getenv("OPENROUTER_MODEL", os.getenv("AI_MODEL", "openai/gpt-3.5-turbo")), # Using gpt-3.5-turbo as a common low-cost default
                source="opencode",
            )

    # Try to configure for opencode-zen
    opencode_zen = auth.get("opencode-zen")
    if isinstance(opencode_zen, dict):
        api_key = str(opencode_zen.get("api_key") or "").strip()
        if api_key:
            # Use deepseek-v4-flash-free as the default for opencode-zen, as it's a small, fast model
            model = os.getenv("AI_MODEL", "deepseek-v4-flash-free")
            # If the auth.json specifies models, we could parse them, but for simplicity
            # and to prioritize low-cost, we stick to deepseek-v4-flash-free
            return AIProviderConfig(
                provider_id="opencode-zen",
                provider_type="openai-compat", # Assuming OpenAI compatibility
                api_key=api_key,
                api_endpoint=os.getenv("OPENCODE_ZEN_API_ENDPOINT", "https://api.opencode-zen.com/v1"), # Placeholder endpoint if not specified
                model=model,
                source="opencode",
            )

    return None


def get_provider_config() -> AIProviderConfig | None:
    if os.getenv("AI_ENABLED", "true").strip().lower() in {"0", "false", "no"}:
        return None
    return _from_env() or _from_opencode()


def get_ai_status() -> dict[str, Any]:
    config = get_provider_config()
    if config is None:
        return {"enabled": False, "provider": None, "model": None, "source": None}
    return {
        "enabled": True,
        "provider": config.provider_id,
        "provider_type": config.provider_type,
        "model": config.model,
        "source": config.source,
    }


def _post_json(url: str, headers: dict[str, str], payload: dict[str, Any], timeout: int) -> dict[str, Any]:
    data = json.dumps(payload).encode("utf-8")
    headers.setdefault("User-Agent", "CareerCounselorAI/1.0")
    request = urllib.request.Request(url, data=data, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise AIGatewayError(f"AI provider returned HTTP {exc.code}: {body[:500]}") from exc
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise AIGatewayError(f"AI provider request failed: {exc}") from exc


def _extract_openai_text(response: dict[str, Any]) -> str:
    output_text = response.get("output_text")
    if isinstance(output_text, str):
        return output_text

    output = response.get("output") or []
    if isinstance(output, list):
        chunks: list[str] = []
        for item in output:
            if not isinstance(item, dict):
                continue
            content = item.get("content") or []
            if not isinstance(content, list):
                continue
            for part in content:
                if isinstance(part, dict) and isinstance(part.get("text"), str):
                    chunks.append(part["text"])
        if chunks:
            return "".join(chunks)

    choices = response.get("choices") or []
    if choices:
        message = choices[0].get("message") or {}
        content = message.get("content")
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            return "".join(part.get("text", "") for part in content if isinstance(part, dict))
    return ""


def _call_openai_responses(config: AIProviderConfig, system_prompt: str, user_prompt: str) -> str:
    endpoint = config.api_endpoint.rstrip("/")
    url = f"{endpoint}/responses"
    payload = {
        "model": config.model,
        "input": [
            {
                "role": "system",
                "content": [{"type": "input_text", "text": system_prompt}],
            },
            {
                "role": "user",
                "content": [{"type": "input_text", "text": user_prompt}],
            },
        ],
        "text": {"format": {"type": "json_object"}},
    }
    headers = {
        "Authorization": f"Bearer {config.api_key}",
        "Content-Type": "application/json",
    }
    response = _post_json(url, headers, payload, int(os.getenv("AI_TIMEOUT_SECONDS", "8")))
    return _extract_openai_text(response)


def _extract_anthropic_text(response: dict[str, Any]) -> str:
    content = response.get("content") or []
    if isinstance(content, list):
        return "".join(part.get("text", "") for part in content if isinstance(part, dict))
    return ""


def _call_openai_compatible(config: AIProviderConfig, system_prompt: str, user_prompt: str) -> str:
    endpoint = config.api_endpoint.rstrip("/")
    url = f"{endpoint}/chat/completions"
    payload = {
        "model": config.model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
    }
    headers = {
        "Authorization": f"Bearer {config.api_key}",
        "Content-Type": "application/json",
    }
    response = _post_json(url, headers, payload, int(os.getenv("AI_TIMEOUT_SECONDS", "8")))
    return _extract_openai_text(response)


def _call_anthropic_compatible(config: AIProviderConfig, system_prompt: str, user_prompt: str) -> str:
    endpoint = config.api_endpoint.rstrip("/")
    url = endpoint if endpoint.endswith("/messages") else f"{endpoint}/v1/messages"
    payload = {
        "model": config.model,
        "max_tokens": int(os.getenv("AI_MAX_TOKENS", "1200")),
        "temperature": 0.2,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_prompt}],
    }
    headers = {
        "x-api-key": config.api_key,
        "anthropic-version": os.getenv("ANTHROPIC_VERSION", "2023-06-01"),
        "Content-Type": "application/json",
    }
    response = _post_json(url, headers, payload, int(os.getenv("AI_TIMEOUT_SECONDS", "8")))
    return _extract_anthropic_text(response)


def _loads_json_object(text: str) -> dict[str, Any]:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = stripped.strip("`")
        if stripped.startswith("json"):
            stripped = stripped[4:]
    start = stripped.find("{")
    end = stripped.rfind("}")
    if start == -1 or end == -1 or end < start:
        raise ValueError("AI response did not contain a JSON object.")
    parsed = json.loads(stripped[start : end + 1])
    if not isinstance(parsed, dict):
        raise ValueError("AI response JSON was not an object.")
    return parsed


def generate_json(system_prompt: str, user_payload: dict[str, Any], fallback: dict[str, Any]) -> dict[str, Any]:
    providers = _get_all_available_providers()
    if not providers:
        return {**fallback, "ai_provider": "none", "ai_used": False, "ai_error": "No AI providers configured"}

    user_prompt = (
        "Return only valid JSON. Use this input payload:\n"
        f"{json.dumps(user_payload, ensure_ascii=True, indent=2)}"
    )

    errors = []

    for config in providers:
        try:
            if config.provider_type == "openai":
                text = _call_openai_responses(config, system_prompt, user_prompt)
            elif config.provider_type in {"openai-compat", "google"}:
                text = _call_openai_compatible(config, system_prompt, user_prompt)
            elif config.provider_type == "anthropic":
                text = _call_anthropic_compatible(config, system_prompt, user_prompt)
            else:
                raise AIGatewayError(f"Unsupported AI provider type: {config.provider_type}")

            parsed = _loads_json_object(text)
            result = {**fallback, **parsed}
            result.setdefault("ai_provider", config.provider_id)
            result.setdefault("ai_model", config.model)
            result["ai_used"] = True
            return result

        except Exception as exc:
            errors.append(f"{config.provider_id}: {exc}")
            continue

    return {**fallback, "ai_provider": "all_failed", "ai_used": False, "ai_error": "; ".join(errors)}
