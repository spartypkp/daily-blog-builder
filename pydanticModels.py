
from pydantic import BaseModel, Field, HttpUrl
from pydantic.types import conlist, Json
from pydantic import BaseModel, validator, ValidationError, model_validator, field_validator, field_serializer, model_serializer, computed_field, ValidationError,ValidationInfo
import json
from typing import Any, Dict, List, Optional, Union, Tuple, Type
from functools import wraps
import datetime
import re
import inspect
from enum import Enum
import xml.etree.ElementTree as ET

pricing_data = {
    "anthropic": {
      "claude-3-opus-20240229": {
        "input_price": "15.00",
        "output_price": "75.00",
        "context_window": 200000,
        "RPM": 2000,
        "TPM": 100000
      },
      "claude-3-sonnet-20240229": {
        "input_price": "3.00",
        "output_price": "15.00",
        "context_window": 200000,
        "RPM": 2000,
        "TPM": 100000
      },
      "claude-3-haiku-20240307": {
        "input_price": "0.25",
        "output_price": "1.25",
        "context_window": 200000,
        "RPM": 2000,
        "TPM": 100000
      }
    },
    "openai": {
      "gpt-4-turbo": {
        "input_price": "10.00",
        "output_price": "30.00",
        "TPM": 800000,
        "RPM": 10000,
        "context_window": 128000
      },
      "gpt-4-0125-preview": {
        "input_price": "10.00",
        "output_price": "30.00",
        "TPM": 800000,
        "RPM": 10000,
        "context_window": 128000
      },
      "gpt-4-1106-preview": {
        "input_price": "10.00",
        "output_price": "30.00",
        "TPM": 800000,
        "RPM": 10000,
        "context_window": 128000
      },
      "gpt-4-1106-vision-preview": {
        "input_price": "10.00",
        "output_price": "30.00",
        "TPM": 150000,
        "RPM": 300000
      },
      "gpt-4": {
        "input_price": "30.00",
        "output_price": "60.00",
        "TPM": 300000,
        "RPM": 10000,
        "context_window": 8192
      },
      "gpt-4-32k": {
        "input_price": "60.00",
        "output_price": "120.00"
      },
      "gpt-3.5-turbo": {
        "input_price": "0.50",
        "output_price": "1.50",
        "TPM": 1000000,
        "RPM": 10000,
        "context_window": 16385
      },
      "gpt-3.5-turbo-0125": {
        "input_price": "0.50",
        "output_price": "1.50",
        "TPM": 1000000,
        "RPM": 10000,
        "context_window": 16385
      },
      "gpt-3.5-turbo-1106": {
        "input_price": "1.00",
        "output_price": "2.00",
        "TPM": 1000000,
        "RPM": 10000,
        "context_window": 16385
      },
      "gpt-3.5-turbo-0301": {
        "input_price": "1.50",
        "output_price": "2.00",
        "TPM": 1000000,
        "RPM": 10000
      },
      "gpt-3.5-turbo-0613": {
        "input_price": "1.50",
        "output_price": "2.00",
        "TPM": 1000000,
        "RPM": 10000
      },
      "gpt-3.5-turbo-instruct": {
        "input_price": "1.50",
        "output_price": "2.00",
        "TPM": 90000,
        "RPM": 3500,
        "context_window": 4096
      },
      "gpt-3.5-turbo-16k": {
        "input_price": "3.00",
        "output_price": "4.00",
        "TPM": 1000000,
        "RPM": 10000,
        "context_window": 16385
      },
      "gpt-3.5-turbo-16k-0613": {
        "input_price": "3.00",
        "output_price": "4.00",
        "TPM": 1000000,
        "RPM": 10000,
        "context_window": 16385
      },
      "text-embedding-3-small": {
        "input_price": "0.02",
        "output_price": "",
        "TPM": 5000000,
        "RPM": 10000
      },
      "text-embedding-3-large": {
        "input_price": "0.13",
        "output_price": "",
        "TPM": 5000000,
        "RPM": 10000
      },
      "text-embedding-ada-002": {
        "input_price": "0.10",
        "output_price": "",
        "TPM": 5000000,
        "RPM": 10000
      },
      "davinci-002": {
        "input_price": "12.00",
        "output_price": "12.00",
        "TPM": 250000,
        "RPM": 3000,
        "context_window": 16384
      },
      "babbage-002": {
        "input_price": "1.60",
        "output_price": "1.60",
        "TPM": 250000,
        "RPM": 3000,
        "context_window": 16384
      }
    }
  }


class RequestType(Enum):
    CLARIFICATION = "clarification"
    EXPANSION = "expansion"
    EXAMPLE = "example"

class RemarkForImprovement(BaseModel):
    location: str = Field(..., description="Identifies the location or context of the remark within the blog post.")
    comment: str = Field(..., description="Detailed comment suggesting how to improve or clarify the blog content. Make Will really describe technical challenges.")

class InteractiveRequest(BaseModel):
    request_type: RequestType = Field(..., description="Type of request to improve the content: clarification, expansion, or example.")
    description: str = Field(..., description="Detailed description of what is being requested for improvement or clarification.")

class IntroductionContent(BaseModel):
    remarks_for_improvement: List[RemarkForImprovement] = Field(default_factory=list, description="Suggestions for enhancing the introduction's clarity or depth.")
    dave_summary: str = Field(..., description="A more detailed summary of Will's original writing for the introduction.")
    dave_commentary: str = Field(..., description="Dave's humorous or insightful commentary on the day's planned activities. Use creativity and humor here, while also providing a lengthy summary of Will's writing from the perspective of Dave. How is Will's starting mood?")
    mood_analysis: str = Field(..., description="A humorous analysis of Will's mood indicated by the mood bar values.")
    interactive_requests: List[InteractiveRequest] = Field(default_factory=list, description="Interactive elements where Dave asks for further details or clarifications from Will. ")

class DailyReflectionContent(BaseModel):
    remarks_for_improvement: List[RemarkForImprovement] = Field(default_factory=list, description="Areas identified by Dave for additional detail or clarification in the reflection.")
    dave_summary: str = Field(..., description="A more detailed summary of Will's original writing for the reflection.")
    dave_commentary: str = Field(..., description="Dave's concluding thoughts or humorous take on the day's outcomes. A detailed summary of challenges faced (maybe overcame, as well as a summary of technical challenges. What did Will accomplish? How is his mood?")
    technical_highlights: List[str] = Field(default_factory=list, description="Key technical accomplishments or challenges highlighted in the reflection.")
    interactive_requests: List[InteractiveRequest] = Field(default_factory=list, description="Interactive elements where Dave asks for further details or clarifications from Will. ")
class DaveResponse(BaseModel):
    introduction: IntroductionContent = Field(..., description="Detailed content for the blog's introduction section.")
    daily_reflection: DailyReflectionContent = Field(..., description="Content for reflecting on the day's work and progress.")
    additional_comments: Optional[str] = Field(None, description="Additional general comments from Dave that might not fit directly into other sections.")

# Submodel for Task
class Task(BaseModel):
    task_description: Optional[str] = Field("", description="Task description.")
    difficulty: Optional[int] = Field(5, description="Task difficulty level.", ge=1, le=10)
    notes: Optional[str] = Field("", description="Notes taken for the task, HTML formatted.")
    reflection: Optional[str] = Field("", description="Reflections on the task.")
    time_spent: Optional[str] = Field("", description="Time spent on the task, e.g., '2 hours'.")
    distraction_meter: Optional[int] = Field(5, description="Distraction level (1-10).", ge=1, le=10)
    next_steps: Optional[str] = Field("", description="Next steps for this task.")

# Main model for the Daily Blog
class DailyBlog(BaseModel):
    date: datetime.date = Field(..., description="Date of the blog entry.")
    daily_goals: Optional[str] = Field("", description="Daily goals for the day.")
    enthusiasm: Optional[int] = Field(50, description="Enthusiasm meter (0-100).", ge=0, le=100)
    burnout: Optional[int] = Field(50, description="Burnout meter (0-100).", ge=0, le=100)
    leetcode_hatred: Optional[int] = Field(99, description="Leetcode hatred meter (0-100).", ge=0, le=100)
    tasks: Optional[List[Task]] = Field(default="", description="List of tasks for the day.")
    daily_reflection: Optional[str] = Field("", description="Reflection on how the day went.")
    next_steps: Optional[str] = Field("", description="Next steps after the day.")
    created_at: Optional[datetime.datetime] = Field(default=None, description="Timestamp for when the blog was created.")
    updated_at: Optional[datetime.datetime] = Field(default=None, description="Timestamp for the last update.")


# ===== API Models =====
class ChatMessage(BaseModel):
    role: str
    content: str

class APIParameters(BaseModel):
    # Common parameters
    vendor: str
    model: str
    messages: List[ChatMessage]
    temperature: float = Field(1, le=1, gt=0)
    top_p: Optional[float] = Field(1, le=1, gt=0)
    frequency_penalty: float = Field(0, le=1, ge=0)
    max_tokens: Optional[int] = None  # Anthropic specific
    stream: Optional[bool] = False

    # OpenAI Specific
    response_format: Optional[Dict[str, Any]] = None
    presence_penalty: float = Field(0, le=1, ge=0)
    # Instructor specific
    response_model: Optional[Type[BaseModel]] = None  # Instructor specific
    max_retries: Optional[int] = Field(default=1)  # Instructor specific
    # Anthropic specific:
    stop_sequences: Optional[List[str]] = Field(default=None)

    # Metadata for cost analysis and logging
    calling_function: Optional[str] = None
    rag_tokens: int = Field(..., description="Number of RAG tokens")

    
    @model_validator(mode="before")
    def set_calling_function(cls, values):
        # If calling_function is not already set, determine it dynamically
        if 'calling_function' not in values or values['calling_function'] is None:
            values['calling_function'] = inspect.stack()[2].function
        return values

class APIUsage(BaseModel):
    response_id: str = Field(..., description="Unique identifier for the record. Primary key.")
    session_id: Optional[str] = Field(default="", description="Unique identifier for the session.")
    calling_function: str = Field(..., description="Name of the Python function that initiated the request")
    vendor: str = Field(..., description="The vendor used for the request")
    model: str = Field(..., description="The LLM model used for the request")
    
    
    input_tokens: Optional[int] = Field(..., description="Number of prompt tokens")
    rag_tokens: Optional[int] = Field(..., description="Number of RAG tokens")
    output_tokens: Optional[int] = Field(..., description="Number of completion tokens")
    total_tokens: Optional[int] = Field(..., description="Total number of tokens used in the request")

    input_cost: Optional[float] = None
    rag_cost: Optional[float] = None
    output_cost: Optional[float] = None
    total_cost: Optional[float] = None

    request_status: Optional[int] = Field("", description="Status of the API request")
    error_message: Optional[str] = Field("", description="Error message if the request failed")
    duration: Optional[float] = Field("", description="Duration of the API request in seconds")

    api_key_name: Optional[str] = Field("", description="Name of the API key used for the request")
    timestamp: datetime.datetime = Field(default="", description="Timestamp of the API request")

    @model_validator(mode='after')
    def compute_cost(self) -> 'APIUsage':
        # Don't recompute if the cost is already set
        if self.total_cost is not None:
            return self
        # Open the JSON file and load pricing data
        # with open("src.utils.api_pricing.json", "r") as file:
        #     pricing_data = json.load(file)
        
        # Access the vendor and model specific pricing information
        try:
            model_pricing = pricing_data[self.vendor][self.model]
        except KeyError:
            raise ValueError(f"Pricing data not found for model {self.model} and vendor {self.vendor}")
        
        # Calculate costs
        self.input_cost = (self.input_tokens / 1e6) * float(model_pricing["input_price"])
        self.output_cost = (self.output_tokens / 1e6) * float(model_pricing["output_price"])
        self.total_cost = self.input_cost + self.output_cost
        return self
    