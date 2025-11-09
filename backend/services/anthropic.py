"""Anthropic API service for resume JSON generation."""

import os
import json
import logging
from typing import Any
from anthropic import Anthropic
from anthropic.types import Message

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AnthropicService:
    """Service for interacting with Anthropic Claude API."""

    MODEL = "claude-sonnet-4-5-20250929"
    MAX_TOKENS = 4096

    # Resume JSON schema template
    RESUME_SCHEMA = {
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "phone": "string",
        "github": "string",
        "website": "string",
        "linkedin": "string",
        "visaStatus": "string (optional)",
        "preferredLocations": "string[] (optional)",
        "openToRemote": "boolean (optional)",
        "experience": [
            {
                "company": "string",
                "location": "string",
                "position": "string",
                "startDate": "string",
                "endDate": "string",
                "achievements": ["string"],
                "companyDescription": "string",
            }
        ],
        "skills": {"[category]": ["string"]},
        "education": [
            {"institution": "string", "degree": "string", "startDate": "string", "endDate": "string"}
        ],
        "summary": "string",
    }

    SYSTEM_PROMPT = f"""You are a resume builder assistant. Your job is to help users build their resume through conversation.

You MUST ALWAYS respond with a JSON object with the following structure:
{{
  "response": "optional string - your message/question/suggestion to the user (ONLY include if you have something to say)",
  "resumeJson": {{ ... resume data matching schema below ... }}
}}

Resume schema for the resumeJson field:
{json.dumps(RESUME_SCHEMA, indent=2)}

Rules for your responses:
1. ALWAYS return valid JSON with both "response" and "resumeJson" fields
2. The "response" field should ONLY be populated when you have:
   - Questions to clarify information
   - Suggestions to improve the resume
   - Feedback about what's missing
   - Otherwise, set it to null or omit it
3. **CRITICAL**: The "resumeJson" field MUST ALWAYS contain the COMPLETE resume with ALL fields
   - If the user provides "CURRENT RESUME STATE" in their message, START WITH THAT EXACT RESUME
   - Apply ONLY the specific changes the user requested to that resume
   - Return the ENTIRE resume with the changes applied, keeping all other fields unchanged
   - NEVER return an empty resume when a current resume state is provided
   - On every update, return the ENTIRE resume, not just the updated fields
   - Include all previously provided information plus any new information
   - Never return partial updates - always return the full resume state
4. All resume fields are optional - use empty string "" or empty array [] for missing data
5. Skills should be categorized (Frontend, Backend, AI Tools, DevOps & Cloud, etc.)
6. Achievements should be specific and measurable
7. Dates should be in YYYY-MM format for startDate/endDate (e.g., "2023-09")
8. Location should include city and state/country (e.g., "Remote", "Dallas, TX", "CA")
9. GitHub, website, and LinkedIn should be full URLs when available
10. openToRemote should be true or false (boolean) when mentioned
11. Education dates: use startDate and endDate fields (not "dates")

Example responses:
- When you have questions: {{"response": "I see you worked at Google. What was your role there?", "resumeJson": {{...}}}}
- When just updating: {{"response": null, "resumeJson": {{...}}}}
- When suggesting improvements: {{"response": "Your resume looks good! Would you like me to add more details to your achievements?", "resumeJson": {{...}}}}"""

    def __init__(self, api_key: str | None = None) -> None:
        """
        Initialize the Anthropic service.

        Args:
            api_key: Anthropic API key. If not provided, reads from ANTHROPIC_API_KEY env var.

        Raises:
            ValueError: If API key is not provided and not found in environment.
        """
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError(
                "ANTHROPIC_API_KEY must be provided or set in environment variables"
            )

        self.client = Anthropic(api_key=self.api_key)
        logger.info("AnthropicService initialized successfully")

    def generate_resume_json(
        self,
        text_content: str,
        messages: list[dict[str, Any]] | None = None
    ) -> dict[str, Any]:
        """
        Generate resume JSON from text content using Claude API.

        Args:
            text_content: Extracted text from uploaded resume file.
            messages: Optional conversation history for iterative updates.
                     Each message should have 'role', 'content', and optionally 'resume' keys.

        Returns:
            Dictionary with two fields:
            - "response": Optional string with AI suggestions/questions (None if no message)
            - "resumeJson": Resume JSON object matching the schema

        Raises:
            ValueError: If the response is not valid JSON.
            Exception: If the API call fails.
        """
        try:
            # Build conversation messages
            conversation_messages = []

            # Add conversation history if provided
            if messages:
                for i, msg in enumerate(messages):
                    # Build the message content
                    message_parts = []

                    # Add resume context if provided in this message
                    resume_data = msg.get("resume")
                    if resume_data:
                        logger.info(f"Message {i} ({msg['role']}) has resume context: {bool(resume_data)}")
                        logger.debug(f"Resume data keys: {list(resume_data.keys()) if isinstance(resume_data, dict) else 'not a dict'}")
                        message_parts.append(
                            f"CURRENT RESUME STATE (use this as the base and apply the user's requested changes):\n{json.dumps(resume_data, indent=2)}\n\nUser's request:"
                        )
                    else:
                        logger.info(f"Message {i} ({msg['role']}) has NO resume context")

                    # Add the message content
                    message_parts.append(msg["content"])

                    # For the last user message, if there's file content uploaded, append it
                    is_last_message = (i == len(messages) - 1)
                    if is_last_message and msg["role"] == "user" and text_content and text_content != msg["content"]:
                        message_parts.append(f"\n\nUploaded file content:\n{text_content}")

                    full_content = "\n".join(message_parts)
                    logger.debug(f"Message {i} full content length: {len(full_content)} chars")

                    conversation_messages.append({
                        "role": msg["role"],
                        "content": full_content
                    })
            else:
                # No conversation history - this is an initial file upload
                # Build the user message with text content
                user_message = f"Extract resume information from this text:\n\n{text_content}"
                conversation_messages.append({"role": "user", "content": user_message})

            logger.info(
                f"Sending request to Anthropic API with {len(conversation_messages)} messages"
            )

            # Make API call
            response: Message = self.client.messages.create(
                model=self.MODEL,
                max_tokens=self.MAX_TOKENS,
                system=self.SYSTEM_PROMPT,
                messages=conversation_messages,
            )

            # Extract response text
            response_text = response.content[0].text

            logger.info("Received response from Anthropic API")
            logger.debug(f"Response text: {response_text}")

            # Parse and validate JSON (now expects both "response" and "resumeJson" fields)
            parsed_response = self._parse_and_validate_json(response_text)

            # Log parsed response details
            ai_response = parsed_response.get("response")
            resume_json = parsed_response.get("resumeJson", {})
            logger.info(
                f"Parsed AI response: "
                f"has_response={ai_response is not None}, "
                f"resume_keys={list(resume_json.keys())}, "
                f"firstName={resume_json.get('firstName')}, "
                f"experience_count={len(resume_json.get('experience', []))}"
            )

            return parsed_response

        except Exception as e:
            logger.error(f"Error generating resume JSON: {str(e)}")
            raise

    def _parse_and_validate_json(self, text: str) -> dict[str, Any]:
        """
        Parse and validate JSON from response text.

        Expects response to have structure:
        {
          "response": "optional string or null",
          "resumeJson": { ... resume data ... }
        }

        Note: Validation is relaxed to support partial resume data. Missing fields
        will be handled by Pydantic schema defaults to prevent 422 errors.

        Args:
            text: Response text from Claude API.

        Returns:
            Parsed JSON object with "response" and "resumeJson" fields.

        Raises:
            ValueError: If the text is not valid JSON or missing required structure.
        """
        # Remove markdown code blocks if present
        cleaned_text = text.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        elif cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[3:]

        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]

        cleaned_text = cleaned_text.strip()

        try:
            parsed_json = json.loads(cleaned_text)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {str(e)}")
            logger.error(f"Response text: {cleaned_text}")
            raise ValueError(f"Invalid JSON response from API: {str(e)}")

        # Check if response has the new structure with "response" and "resumeJson" fields
        if "resumeJson" in parsed_json:
            # New structure - extract both fields
            ai_response = parsed_json.get("response")
            resume_json = parsed_json.get("resumeJson", {})

            # Ensure ai_response is None if empty/null
            if ai_response == "" or ai_response is None:
                ai_response = None

            logger.info(f"Parsed new response structure. AI response present: {ai_response is not None}")
        else:
            # Backward compatibility: If AI returns old format (just resume JSON),
            # treat entire response as resumeJson with no AI message
            logger.warning("AI returned old format (no 'resumeJson' field). Using entire response as resume data.")
            resume_json = parsed_json
            ai_response = None

        # Validate and set defaults for resume_json fields
        # Set defaults for missing top-level fields to prevent type errors
        if "experience" not in resume_json:
            resume_json["experience"] = []
        if "skills" not in resume_json:
            resume_json["skills"] = {}
        if "education" not in resume_json:
            resume_json["education"] = []

        # Validate types only if fields are present
        if not isinstance(resume_json.get("experience"), list):
            logger.warning("experience field is not an array, defaulting to empty array")
            resume_json["experience"] = []

        if not isinstance(resume_json.get("skills"), dict):
            logger.warning("skills field is not an object, defaulting to empty object")
            resume_json["skills"] = {}

        if not isinstance(resume_json.get("education"), list):
            logger.warning("education field is not an array, defaulting to empty array")
            resume_json["education"] = []

        logger.info("Resume JSON parsed successfully (partial data allowed)")

        # Return structure with both fields
        return {
            "response": ai_response,
            "resumeJson": resume_json
        }
