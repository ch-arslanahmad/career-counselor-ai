import os
import sys
import unittest
from contextlib import contextmanager
from unittest.mock import patch

# Adjust the path to import ai_gateway from the services directory
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "services")))
import ai_gateway

# Define a simple prompt for testing
TEST_SYSTEM_PROMPT = "You are a helpful AI assistant."
TEST_USER_PAYLOAD = {"question": "What is the capital of France?"}
TEST_FALLBACK_PAYLOAD = {"answer": "Paris"}

@contextmanager
def set_env(env_vars: dict):
    old_env = {key: os.getenv(key) for key in env_vars}
    os.environ.update(env_vars)
    try:
        yield
    finally:
        for key, value in old_env.items():
            if value is None:
                del os.environ[key]
            else:
                os.environ[key] = value


class TestAIGatewayProviders(unittest.TestCase):

    def test_openai_provider(self):
        print("\n--- Testing OpenAI Provider ---")
        with set_env({
            "AI_ENABLED": "true",
            "AI_PROVIDER": "openai",
            "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY", "sk-test-openai"), # Use real key if available
            "OPENAI_MODEL": os.getenv("OPENAI_MODEL", "gpt-3.5-turbo"),
            "OPENAI_API_ENDPOINT": os.getenv("OPENAI_API_ENDPOINT", ai_gateway.DEFAULT_OPENAI_ENDPOINT)
        }):
            if not os.getenv("OPENAI_API_KEY"):
                print("Skipping OpenAI test: OPENAI_API_KEY not set in environment.")
                return

            status = ai_gateway.get_ai_status()
            print(f"OpenAI Status: {status}")
            self.assertTrue(status["enabled"])
            self.assertEqual(status["provider"], "openai")

            try:
                response = ai_gateway.generate_json(TEST_SYSTEM_PROMPT, TEST_USER_PAYLOAD, TEST_FALLBACK_PAYLOAD)
                print(f"OpenAI Response: {response}")
                self.assertIn("answer", response)
                self.assertEqual(response["ai_provider"], "openai")
                self.assertTrue(response["ai_used"])
                print("OpenAI test PASSED.")
            except ai_gateway.AIGatewayError as e:
                print(f"OpenAI test FAILED: {e}")
                self.fail(f"OpenAI API call failed: {e}")
            except Exception as e:
                print(f"OpenAI test FAILED with unexpected error: {e}")
                self.fail(f"OpenAI test failed: {e}")


    def test_anthropic_provider(self):
        print("\n--- Testing Anthropic Provider ---")
        with set_env({
            "AI_ENABLED": "true",
            "AI_PROVIDER": "anthropic",
            "ANTHROPIC_API_KEY": os.getenv("ANTHROPIC_API_KEY", "sk-test-anthropic"), # Use real key if available
            "ANTHROPIC_MODEL": os.getenv("ANTHROPIC_MODEL", "claude-3-haiku-20240307"),
            "ANTHROPIC_API_ENDPOINT": os.getenv("ANTHROPIC_API_ENDPOINT", ai_gateway.DEFAULT_ANTHROPIC_ENDPOINT)
        }):
            if not os.getenv("ANTHROPIC_API_KEY"):
                print("Skipping Anthropic test: ANTHROPIC_API_KEY not set in environment.")
                return

            status = ai_gateway.get_ai_status()
            print(f"Anthropic Status: {status}")
            self.assertTrue(status["enabled"])
            self.assertEqual(status["provider"], "anthropic")

            try:
                response = ai_gateway.generate_json(TEST_SYSTEM_PROMPT, TEST_USER_PAYLOAD, TEST_FALLBACK_PAYLOAD)
                print(f"Anthropic Response: {response}")
                self.assertIn("answer", response)
                self.assertEqual(response["ai_provider"], "anthropic")
                self.assertTrue(response["ai_used"])
                print("Anthropic test PASSED.")
            except ai_gateway.AIGatewayError as e:
                print(f"Anthropic test FAILED: {e}")
                self.fail(f"Anthropic API call failed: {e}")
            except Exception as e:
                print(f"Anthropic test FAILED with unexpected error: {e}")
                self.fail(f"Anthropic test failed: {e}")

    @patch('ai_gateway._read_json')
    def test_openrouter_provider(self, mock_read_json):
        print("\n--- Testing OpenRouter Provider (from opencode or env) ---")
        # Simulate opencode config for openrouter
        mock_read_json.return_value = {
            "openrouter": {
                "key": os.getenv("OPENROUTER_API_KEY_FROM_AUTH", "sk-test-openrouter-auth")
            }
        }
        with set_env({
            "AI_ENABLED": "true",
            "AI_PROVIDER": "openrouter",
            "OPENROUTER_API_KEY": os.getenv("OPENROUTER_API_KEY", ""), # Allow env to override auth
            "OPENROUTER_MODEL": os.getenv("OPENROUTER_MODEL", "openai/gpt-3.5-turbo"),
            "OPENROUTER_API_ENDPOINT": os.getenv("OPENROUTER_API_ENDPOINT", "https://openrouter.ai/api/v1")
        }):
            api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENROUTER_API_KEY_FROM_AUTH")
            if not api_key:
                print("Skipping OpenRouter test: OPENROUTER_API_KEY not set in environment or provided via auth mock.")
                return

            status = ai_gateway.get_ai_status()
            print(f"OpenRouter Status: {status}")
            self.assertTrue(status["enabled"])
            self.assertEqual(status["provider"], "openrouter")

            try:
                response = ai_gateway.generate_json(TEST_SYSTEM_PROMPT, TEST_USER_PAYLOAD, TEST_FALLBACK_PAYLOAD)
                print(f"OpenRouter Response: {response}")
                self.assertIn("answer", response)
                self.assertEqual(response["ai_provider"], "openrouter")
                self.assertTrue(response["ai_used"])
                print("OpenRouter test PASSED.")
            except ai_gateway.AIGatewayError as e:
                print(f"OpenRouter test FAILED: {e}")
                self.fail(f"OpenRouter API call failed: {e}")
            except Exception as e:
                print(f"OpenRouter test FAILED with unexpected error: {e}")
                self.fail(f"OpenRouter test failed: {e}")

    @patch('ai_gateway._read_json')
    def test_opencode_zen_provider(self, mock_read_json):
        print("\n--- Testing Opencode-Zen Provider (from opencode) ---")
        # Simulate opencode config for opencode-zen
        mock_read_json.return_value = {
            "opencode-zen": {
                "api_key": os.getenv("OPENCODE_ZEN_API_KEY", "sk-test-opencode-zen"),
                "mcp_server": "capsule-service"
            }
        }
        with set_env({
            "AI_ENABLED": "true",
            "AI_PROVIDER": "opencode-zen",
            "AI_MODEL": os.getenv("OPENCODE_ZEN_MODEL", "deepseek-v4-flash-free"),
            "OPENCODE_ZEN_API_ENDPOINT": os.getenv("OPENCODE_ZEN_API_ENDPOINT", "https://api.opencode-zen.com/v1")
        }):
            if not os.getenv("OPENCODE_ZEN_API_KEY") and not mock_read_json.return_value["opencode-zen"]["api_key"]:
                 print("Skipping Opencode-Zen test: OPENCODE_ZEN_API_KEY not set in environment or provided via auth mock.")
                 return

            status = ai_gateway.get_ai_status()
            print(f"Opencode-Zen Status: {status}")
            self.assertTrue(status["enabled"])
            self.assertEqual(status["provider"], "opencode-zen")

            try:
                response = ai_gateway.generate_json(TEST_SYSTEM_PROMPT, TEST_USER_PAYLOAD, TEST_FALLBACK_PAYLOAD)
                print(f"Opencode-Zen Response: {response}")
                self.assertIn("answer", response)
                self.assertEqual(response["ai_provider"], "opencode-zen")
                self.assertTrue(response["ai_used"])
                print("Opencode-Zen test PASSED.")
            except ai_gateway.AIGatewayError as e:
                print(f"Opencode-Zen test FAILED: {e}")
                self.fail(f"Opencode-Zen API call failed: {e}")
            except Exception as e:
                print(f"Opencode-Zen test FAILED with unexpected error: {e}")
                self.fail(f"Opencode-Zen test failed: {e}")

if __name__ == "__main__":
    # Ensure dotenv is loaded before running tests
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env")))
    unittest.main()
