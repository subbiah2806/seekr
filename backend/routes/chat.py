"""
API routes for resume chatbot functionality
"""
from fastapi import APIRouter, HTTPException, status
import logging

from models.schemas import ChatRequest, ChatResponse, ResumeData
from services.anthropic import AnthropicService

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse, status_code=200)
async def chat(request: ChatRequest):
    """
    Chat endpoint for resume generation and updates.

    This endpoint accepts chat messages and optional file content to generate
    or update resume JSON using Claude AI. It supports both initial resume
    creation from uploaded text and iterative updates through conversation.

    The endpoint handles partial resume data gracefully by applying default
    values for missing fields, preventing 422 validation errors and enabling
    iterative resume building through multiple chat turns.

    Args:
        request: ChatRequest containing message history and optional file content

    Returns:
        ChatResponse with generated/updated resume JSON and success message.
        Partial resumes are accepted with default values for missing fields.

    Raises:
        HTTPException 500: If ANTHROPIC_API_KEY is not configured
        HTTPException 503: If Anthropic API call fails
        HTTPException 422: If file_content and user messages are both missing

    Examples:
        Initial upload:
        ```json
        {
            "messages": [
                {"role": "user", "content": "Extract my resume information"}
            ],
            "file_content": "John Doe\\nEmail: john@example.com\\n..."
        }
        ```

        Iterative update:
        ```json
        {
            "messages": [
                {"role": "user", "content": "Update my email to newemail@example.com"}
            ],
            "file_content": null
        }
        ```
    """
    try:
        # Initialize Anthropic service
        try:
            service = AnthropicService()
        except ValueError as e:
            logger.error(f"Failed to initialize AnthropicService: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="ANTHROPIC_API_KEY is not configured. Please set the environment variable."
            )

        # Prepare conversation messages for Anthropic API
        # Convert Pydantic ChatMessage objects to dict format (including resume field)
        conversation_messages = [
            {"role": msg.role, "content": msg.content, "resume": msg.resume}
            for msg in request.messages
        ]

        # Determine text content for resume extraction
        # Use file_content if provided, otherwise use the last user message
        text_content = request.file_content
        if not text_content:
            # Extract text from conversation (use last user message as fallback)
            user_messages = [msg for msg in request.messages if msg.role == "user"]
            if user_messages:
                text_content = user_messages[-1].content
            else:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Either file_content or user messages must be provided"
                )

        logger.info(f"Processing chat request with {len(request.messages)} messages")

        # Log message details for debugging
        for i, msg in enumerate(conversation_messages):
            has_resume = msg.get("resume") is not None
            resume_keys = list(msg["resume"].keys()) if has_resume and isinstance(msg["resume"], dict) else []
            first_name = msg["resume"].get("firstName") if has_resume and isinstance(msg["resume"], dict) else None
            logger.info(
                f"  Message {i} ({msg['role']}): "
                f"content_length={len(msg['content'])}, "
                f"has_resume={has_resume}, "
                f"resume_keys={resume_keys}, "
                f"firstName={first_name}"
            )

        # Generate resume JSON using Anthropic service
        try:
            # Always pass messages (even if there's only 1) to include resume context
            response_data = service.generate_resume_json(
                text_content=text_content,
                messages=conversation_messages
            )

            # Extract response and resumeJson from the service response
            ai_response = response_data.get("response")
            resume_json_dict = response_data.get("resumeJson", {})
        except ValueError as e:
            # JSON parsing error (malformed JSON from AI)
            logger.error(f"JSON parsing error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"AI service returned invalid JSON format: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Anthropic API error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Failed to communicate with AI service: {str(e)}"
            )

        # Validate response with Pydantic model
        # Note: Validation is relaxed to support partial resume data.
        # Pydantic will apply default values for missing fields automatically.
        try:
            resume_data = ResumeData(**resume_json_dict)
            logger.info("Resume data validated successfully with Pydantic schema")
        except Exception as e:
            # Log validation error but don't fail - apply defaults instead
            logger.warning(f"Pydantic validation encountered issues: {str(e)}")
            logger.info("Attempting to create resume with default values for invalid fields")

            # Create resume with defaults by passing only valid fields
            # Pydantic will handle missing/invalid fields with defaults
            try:
                # Filter out any problematic fields and let Pydantic apply defaults
                resume_data = ResumeData.model_validate(resume_json_dict, strict=False)
                logger.info("Resume data created with partial validation and defaults applied")
            except Exception as validation_error:
                # If even relaxed validation fails, create with minimal data
                logger.error(f"Failed relaxed validation: {str(validation_error)}")
                logger.info("Creating resume with minimal defaults")
                resume_data = ResumeData()  # Empty resume with all defaults

        logger.info("Successfully generated resume JSON")

        # Log AI response if present
        if ai_response:
            logger.info(f"AI response included: {ai_response[:100]}...")

        # Log final response being returned
        logger.info(
            f"Returning response: "
            f"has_ai_response={ai_response is not None}, "
            f"resume_firstName={resume_data.firstName}, "
            f"resume_experience_count={len(resume_data.experience) if resume_data.experience else 0}"
        )

        # Return response with both resume_json and optional AI response
        return ChatResponse(
            resume_json=resume_data,
            response=ai_response,
            message="Resume generated successfully"
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Catch any unexpected errors
        logger.error(f"Unexpected error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
