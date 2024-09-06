
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
    dave_summary: str = Field(..., description="A more detailed summary of Will's original writing for the introduction.")
    remarks_for_improvement: List[RemarkForImprovement] = Field(default_factory=list, description="Suggestions for enhancing the introduction's clarity or depth. What major themes did Will leave out?")
    interactive_requests: List[InteractiveRequest] = Field(default_factory=list, description="Interactive elements where Dave asks for further details or clarifications from Will, specifically about explaining technical matters ")

class DailyReflectionContent(BaseModel):
    dave_summary: str = Field(..., description="A more detailed summary of Will's original writing for the reflection.")
    remarks_for_improvement: List[RemarkForImprovement] = Field(default_factory=list, description="Areas identified by Dave for additional detail or clarification in the reflection.")
    technical_highlights: List[str] = Field(default_factory=list, description="Key technical accomplishments or challenges highlighted in the reflection.")
    interactive_requests: List[InteractiveRequest] = Field(default_factory=list, description="Interactive elements where Dave asks for further details or clarifications from Will, specifically about explaining technical matters")
class DaveResponse(BaseModel):
    introduction: IntroductionContent = Field(..., description="Detailed content for the blog's introduction section.")
    daily_reflection: DailyReflectionContent = Field(..., description="Content for reflecting on the day's work and progress.")

# Submodel for Task
class Task(BaseModel):
    # Task Start - filled out at start of task
    task_goal: Optional[str] = Field("", description="Desired outcome or goal for the task.")
    task_description: Optional[str] = Field("", description="Description of the task or problem.")
    task_expected_difficulty: Optional[int] = Field(50, description="Focus level (0-100).", ge=0, le=100)
    task_planned_approach: Optional[str] = Field("", description="Method or strategy Will plans to use to tackle the problem.")

    # Task Work - Ongoing throughout day
    task_progress_notes: Optional[str] = Field("", description="Main writing area for Will to document  his progress.")
    challenges_encountered: Optional[str] = Field("", description="Key challenges or bugs encountered.")
    research_questions: Optional[str] = Field("", description="An always updated list of research questions Will had while working on the task")
    
    # Task Reflection - filled out after task completion
    tools_used: Optional[str] = Field("", description="Key tools, libraries, or frameworks used during the task.")
    reflection_successes: Optional[str] = Field("", description="What worked well during the task?")
    reflection_failures: Optional[str] = Field("", description="What didn't work, and why?")
    output_or_result: Optional[str] = Field("", description="The outcome or deliverable from this task (e.g., code, documentation).")
    time_spent_coding: Optional[str] = Field("", description="Time spent actively coding (e.g., '2 hours').")
    time_spent_researching: Optional[str] = Field("", description="Time spent researching (e.g., '30 minutes').")
    time_spent_debugging: Optional[str] = Field("", description="Time spent debugging (e.g., '45 minutes').")
    follow_up_tasks: Optional[str] = Field("", description="Immediate next steps or follow-up tasks.")

class Introduction(BaseModel):
    personal_context: Optional[str] = Field("", description="Additional context for the day (e.g., external factors).")
    daily_goals: Optional[str] = Field("", description="Main tasks or goals for the day.")
    learning_focus: Optional[str] = Field("", description="What Will wants to learn or improve on today.")
    challenges: Optional[str] = Field("", description="Known challenges or experiments for the day.")
    plan_of_action: Optional[str] = Field("", description="Will's initial plan for tackling the daily_goals and challenges today.")

    focus_level: Optional[int] = Field(50, description="Focus level (0-100).", ge=0, le=100)
    enthusiasm_level: Optional[int] = Field(50, description="Enthusiasm meter (0-100).", ge=0, le=100)
    burnout_level: Optional[int] = Field(50, description="Burnout meter (0-100).", ge=0, le=100)
    leetcode_hatred_level: Optional[int] = Field(99, description="LeetCode hatred meter (0-100).", ge=0, le=100)
    
class Reflection(BaseModel):
    technical_challenges: Optional[str] = Field("", description="Notable technical challenges or obstacles faced.")
    interesting_bugs: Optional[str] = Field("", description="Details of any interesting bugs encountered.")
    unanswered_questions: Optional[str] = Field("", description="Unanswered technical questions or topics for further research.")
    learning_outcomes: Optional[str] = Field("", description="Key takeaways and things learned during the day.")
    next_steps_short_term: Optional[str] = Field("", description="Immediate next steps or tasks for tomorrow.")
    next_steps_long_term: Optional[str] = Field("", description="Long-term goals or ongoing technical objectives.")
    
    # Humorous & Self-Reflective Mood Sliders
    productivity_level: Optional[int] = Field(50, description="Self-evaluation: Productivity (0-100).", ge=0, le=100)
    distraction_level: Optional[int] = Field(50, description="Self-evaluation: How Distracted were you (0-100).", ge=0, le=100)
    desire_to_play_steam_games_level: Optional[int] = Field(50, description="Desire to play Steam games (0-100). It's always Europa Universalis IV", ge=0, le=100)
    overall_frustration_level: Optional[int] = Field(50, description="Frustration level (0-100).", ge=0, le=100)

# Main model for the Daily Blog
class DailyBlog(BaseModel):
    date: datetime.date = Field(..., description="Date of the blog entry.")
    introduction: Optional[Introduction] = Field(default=Introduction(), description="The introduction to Will's daily blog.")
    tasks: List[Task] = Field(default_factory=lambda: [Task()], description="List of technical tasks Will completed for the day.")
    reflection: Optional[Reflection] = Field(default=Reflection(), description="The reflection portion of Will's daily blog")
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
    