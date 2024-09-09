import tiktoken
import psycopg
import json
import os
import concurrent.futures
import sys
import anthropic
from psycopg.rows import class_row, dict_row
from typing import Optional, List, Any, Dict, Callable, Tuple, Type, Union
from openai import OpenAI
from anthropic import Anthropic
from anthropic.types import MessageParam
import instructor
import pydantic
from pydantic import BaseModel, Field, model_validator
from pydanticModels import APIParameters, ChatMessage, APIUsage
from datetime import datetime
import time
import math
import inspect

import re
import uuid
DIR = os.path.dirname(os.path.realpath(__file__))

from supabase import create_client, Client

from dotenv import load_dotenv
import os

load_dotenv()
supabase_url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_SERVICE_KEY")

supabase: Client = create_client(supabase_url, key)

api_key_openai_name = "Personal Key"
openai_client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
)
api_key_anthropic_name = "Personal Key"
anthropic_client = Anthropic(
    api_key=os.getenv("OPENAI_API_KEY")
)


instructor_openai_client = instructor.from_openai(OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
))
instructor_anthropic_client = instructor.from_anthropic(Anthropic(
    api_key=os.getenv("OPENAI_API_KEY")
))



def main():
    pass


def convert_to_messages(user: str, system: Optional[str] = None) -> List[ChatMessage]:
    """
    Converts a user string and an optional system string into a list of ChatMessage objects.

    This function is primarily used for preparing data to be used with the OpenAI or Anthropic AI.

    Args:
    user (str): The user's message. This will be converted into a ChatMessage with role 'user'.
    system (Optional[str]): An optional system message. If provided, this will be converted into a ChatMessage with role 'system'. Defaults to None. Not required for Anthropic.

    Returns:
    List[ChatMessage]: A list of ChatMessage objects. If a system message was provided, the list will contain two messages: the system message followed by the user message. Otherwise, the list will contain only the user message.
    """
    messages = []
    if system:
        messages.append(ChatMessage(role="system", content=system))
    messages.append(ChatMessage(role="user", content=user))
    return messages


def create_chat_completion(params: APIParameters, user: Optional[str] = None, insert_usage: bool = True ) -> Tuple[Union[str, Type[BaseModel]], APIUsage]:
    """
    Routes the chat completion request to the appropriate vendor's API based on the vendor specified in the parameters.

    Args:
        params (APIParameters): The parameters for the API call as the APIParameters Pydantic Model.
        user (str, optional): The requesting user's DB name. Defaults to None.
        insert_usage (bool, optional): Flag to determine if usage data should be inserted. Defaults to True.

    Raises:
        ValueError: If an unsupported vendor is provided or if user is not provided when insert_usage is True.

    Returns:
        Tuple[str, APIUsage]: The chat completion response and usage data.
    """
    if params.vendor.lower() == 'openai':
        response_tuple = create_chat_completion_openai(params)
    elif 'instructor/' in params.vendor.lower():
        response_tuple = create_chat_completion_instructor(params)
    elif params.vendor.lower() == 'anthropic':
        response_tuple =  create_chat_completetion_anthropic(params)
    else:
        raise ValueError("Unsupported vendor")
    
    if insert_usage:
        if user is None:
            raise ValueError("User must be provided to insert usage data!")
        response_tuple[1].insert(user=user)
    return response_tuple

def create_chat_completion_openai(params: APIParameters) -> Tuple[str, APIUsage]:
    """
    Calls the OpenAI ChatCompletion API and returns the completion message and usage data.

    Args:
        params (APIParameters): The parameters for the API call as the APIParameters Pydantic Model.

    Returns:
        Tuple[str, APIUsage]: The chat completion response and usage data.
    """
    start = time.time()
    try:
        # Additional check for response_format presence
        response_format = params.response_format or None
        
        completion = openai_client.chat.completions.create(
            model=params.model,
            messages=params.messages,
            temperature=params.temperature,
            top_p=params.top_p,
            frequency_penalty=params.frequency_penalty,
            presence_penalty=params.presence_penalty,
            stream=params.stream,
            response_format=response_format  # Use response_format if provided
        )

        if not completion:
            raise Exception(f"OpenAI API call failed with status: {completion}")
        
        status = 200
        response_id = completion.id
        error_message = None
        duration = time.time() - start
        content: str = completion.choices[0].message.content

        usage = completion.usage

        input_tokens = usage.prompt_tokens
        output_tokens = usage.completion_tokens
        total_tokens = usage.total_tokens

    except Exception as error:
        print(f"Error: {error}")
        status = 400
        error_message = str(error)
        duration = None
        content = None
        input_tokens, output_tokens, total_tokens = None, None, None
        response_id = None

    usage = APIUsage(model=params.model, 
                    vendor=params.vendor, 
                    response_id=response_id,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    total_tokens=total_tokens,
                    request_status=status,
                    error_message=error_message,
                    calling_function=params.calling_function,
                    timestamp=datetime.now(),
                    duration=duration,
                    api_key_name=api_key_openai_name,
                    rag_tokens=params.rag_tokens
                    )

    return content, usage

# Calls the Anthropic ChatCompletion API and returns the completion message
def create_chat_completetion_anthropic(params: APIParameters) -> Tuple[str, APIUsage]:
    """
    Calls the Anthropic ChatCompletion API and returns the completion message and usage data.

    Args:
        params (APIParameters): The parameters for the API call as the APIParameters Pydantic Model.

    Returns:
        Tuple[str, APIUsage]: The chat completion response and usage data.
    """
    start = time.time()
    
    try:
        
        
        if params.messages[0].role != "system":
            system = None
        else:
            system = params.messages.pop(0).content
        real_messages = []
        
        for msg in params.messages:
            real_messages.append(msg.model_dump())
        

        completion = anthropic_client.messages.create(
            model=params.model,
            system = system,
            max_tokens=params.max_tokens,
            stream=params.stream,
            temperature=params.temperature,
            top_p=params.top_p,
            messages=real_messages
            
        )
        if not completion:
            raise Exception(f"Anthropic API call failed with status: {completion}")
        
        usage = completion.usage
        print(usage)
        input_tokens = usage.input_tokens
        output_tokens = usage.output_tokens
        total_tokens = input_tokens + output_tokens

        status = 200
        error_message = None
        duration = time.time() - start
        content = completion.content
        #print(content)
        content = content[0].text
        #print(content)
        response_id = completion.id

    except Exception as error:
        status = 400
        error_message = str(error)
        print(f"Error: {error}")
        duration = None
        content = None
        response_id = f"ERROR-{str(uuid.uuid4())}"
        input_tokens, output_tokens, total_tokens = None, None, None

    
    usage = APIUsage(model=params.model, 
                    vendor=params.vendor, 
                    response_id=response_id,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    total_tokens=total_tokens,
                    request_status=status,
                    error_message=error_message,
                    calling_function=params.calling_function,
                    timestamp=datetime.now(),
                    duration=duration,
                    api_key_name=api_key_openai_name,
                    rag_tokens=params.rag_tokens
                    )

    return content, usage

# Calls the Instructor ChatCompletion API and returns the completion message and usage data
def create_chat_completion_instructor(params: APIParameters) -> Tuple[Type[BaseModel], APIUsage]:
    """
    Calls the Instructor ChatCompletion API and returns the completion message and usage data.

    Args:
        params (APIParameters): The parameters for the API call as the APIParameters Pydantic Model.

    Returns:
        Tuple[str, APIUsage]: The chat completion response and usage data.
    """
    start = time.time()
    actual_vendor = params.vendor.split("/")[1].lower()
    params.vendor = actual_vendor


    try:
        if params.vendor == "openai":
            

            completion: Type[BaseModel] = instructor_openai_client.chat.completions.create(
                model=params.model,
                response_model=params.response_model,
                max_retries=params.max_retries,
                messages=params.messages,
                temperature=params.temperature,
                top_p=params.top_p,
                frequency_penalty=params.frequency_penalty,
                presence_penalty=params.presence_penalty,
                stream=params.stream,
            )
        elif params.vendor == "anthropic":

            if params.messages[0].role != "system":
                system = None
            else:
                system = params.messages.pop(0).content
            real_messages = []
            
            for msg in params.messages:
                real_messages.append(msg.model_dump())

            completion: Type[BaseModel] = instructor_anthropic_client.messages.create(
                model=params.model,
                system=system,
                response_model=params.response_model,
                max_retries=params.max_retries,
                messages=real_messages,
                temperature=params.temperature,
                top_p=params.top_p,
                stream=params.stream,
                max_tokens=params.max_tokens
                
            )
        else:
            raise ValueError(f"Unsuppoprted vendor for instructor!")
            
            # completion: Type[BaseModel] = instructor_anthropic_client(
            #     model=params.model,
            #     max_tokens=params.max_tokens,
            #     max_retries=params.max_retries,
            #     messages=params.messages,
            #     response_model=params.response_model,
            # )  # type: ignore
            
    
        # Additional check for response_format presence
        
        
        

        if not completion:
            raise Exception(f"Instructor {params.vendor} API call failed with status: {completion}")
        
        status = 200
        response_id = completion._raw_response.id
        error_message = None
        duration = time.time() - start
        
        usage = completion._raw_response.usage

        input_tokens = usage.prompt_tokens
        output_tokens = usage.completion_tokens
        total_tokens = usage.total_tokens

    except Exception as error:
        print(f"Error: {error}")
        status = 400
        error_message = str(error)
        duration = None
        
        input_tokens, output_tokens, total_tokens = None, None, None
        response_id = f"ERROR-{str(uuid.uuid4())}"
    

    usage = APIUsage(model=params.model, 
                    vendor=params.vendor, 
                    response_id=response_id,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    total_tokens=total_tokens,
                    request_status=status,
                    error_message=error_message,
                    calling_function=params.calling_function,
                    timestamp=datetime.now(),
                    duration=duration,
                    api_key_name=api_key_openai_name,
                    rag_tokens=params.rag_tokens
                    )

    return completion, usage




    
# Creates a vector embedding from a string of text
def create_embedding(input_text):
    """Create an embedding from a string of text."""
    response = openai_client.embeddings.create(
        input=input_text,
        model="text-embedding-ada-002"
    )
    return response.data[0].embedding
     

# ===== Database Functions =====
def db_connect(row_factory=None):
    """ Connect to the PostgreSQL database server """
    conn = None
    try:
        # connect to the PostgreSQL server
        db_name = os.getenv("DB_NAME")
        db_host = os.getenv("DB_HOST")
        db_username = os.getenv("DB_USERNAME")
        db_password = os.getenv("DB_PASSWORD")
        db_port = os.getenv("DB_PORT")

        conn = psycopg.connect(dbname=db_name,host=db_host,user=db_username,password=db_password,port=db_port,client_encoding="utf8")
        
            
		
        if row_factory is not None:
            conn.row_factory = row_factory
        return conn
    except (Exception, psycopg.DatabaseError) as error:
        print(error)
        raise error


def pydantic_select(sql_select: str, modelType: Any) -> List[Any]:
    """
    Executes a SQL SELECT statement and returns the result rows as a list of Pydantic models.

    Args:
        sql_select (str): The SQL SELECT statement to execute.
        modelType (Optional[Any]): The Pydantic model to use for the Psycopg row factory.   

    Returns:
        List[Any]: The rows returned by the SELECT statement as a list of Pydantic Models.
    """   
    # Use the provided modelType (PydanticModel) for the row factory
    if modelType:
        conn = db_connect(row_factory=class_row(modelType))
    

    cur = conn.cursor()

    # Execute the SELECT statement
    cur.execute(sql_select)

    # Fetch all rows
    rows = cur.fetchall()
    

    # Close the cursor and the connection
    cur.close()
    conn.close()

    return rows

def regular_select(sql_select: str, ) -> List[Dict[str, Any]]:
    """
    Executes a SQL SELECT statement and returns the result rows as List of dictionaries.

    Args:
        sql_select (str): The SQL SELECT statement to execute..
        user (Optional[str]): The user making the request

    Returns:
        List[str, Any]: The rows returned by the SELECT statement as a List of Dictionaries.
    """   
    # If they provide a pydantic model, use it for the row factory
    conn = db_connect(row_factory=dict_row)

    cur = conn.cursor()

    # Execute the SELECT statement
    cur.execute(sql_select)

    # Fetch all rows
    rows = cur.fetchall()
    

    # Close the cursor and the connection
    cur.close()
    conn.close()

    return rows


def pydantic_insert(table_name: str, models: List[Any]):
    """
    Inserts the provided List of Pydantic Models into the specified table.

    Args:
        table_name (str): The name of the table to insert into.
        nodes (List[Any]): The list of Pydantic Models to insert.
        user (str): The user making the request.
    """
    # Get the psycopg3 connection object
    conn = db_connect()

    with conn.cursor() as cursor:
        for model in models:
            # Convert the NodeModel to a dictionary and exclude default values
            
            model_dict = model.model_dump(mode="json",exclude_defaults=True)

            for key, value in model_dict.items():
                
                if type(value) == dict or type(value) == list:
                    model_dict[key] = json.dumps(value)

            # 
            

            # Prepare the column names and placeholders
            columns = ', '.join(model_dict.keys())
            placeholders = ', '.join(['%s'] * len(model_dict))

            

            # Create the INSERT statement using psycopg.sql to safely handle identifiers
            query = psycopg.sql.SQL("INSERT INTO {} ({}) VALUES ({})").format(
                psycopg.sql.Identifier(table_name),
                psycopg.sql.SQL(columns),
                psycopg.sql.SQL(placeholders)
            )

            # Execute the INSERT statement
            cursor.execute(query, tuple(model_dict.values()))

    # Commit the changes
    conn.commit()
    conn.close()

def regular_insert(table_name: str, dicts: List[Dict[str, Any]]):
    """
    Inserts the provided List of Dictionaries into the specified table.

    Args:
        table_name (str): The name of the table to insert into.
        dicts (List[Dict[str, Any]]): The list of dictionaries to insert.
        user (str): The user making the request.
    """
    # Get the psycopg3 connection object
    conn = db_connect()

    with conn.cursor() as cursor:
        for d in dicts:
            # Convert the NodeModel to a dictionary and exclude default values
            
            

            # Prepare the column names and placeholders
            columns = ', '.join(d.keys())
            placeholders = ', '.join(['%s'] * len(d))

            

            # Create the INSERT statement using psycopg.sql to safely handle identifiers
            query = psycopg.sql.SQL("INSERT INTO {} ({}) VALUES ({})").format(
                psycopg.sql.Identifier(table_name),
                psycopg.sql.SQL(columns),
                psycopg.sql.SQL(placeholders)
            )

            # Execute the INSERT statement
            cursor.execute(query, tuple(d.values()))

    # Commit the changes
    conn.commit()
    conn.close()


def pydantic_update(table_name: str, models: List[Any], where_field: str, update_columns: Optional[List[str]] = None ):
    """
    Updates the specified table with the provided List of Pydantic Models.

    Args:
        table_name (str): The name of the table to update.
        nodes (List[PydanticModel]): The nodes to use for the update.
        where_field (str): The field to use in the WHERE clause of the update statement.
        update_columns (Optional[List[str]]): The columns to include in the update. If None, all fields are included. Defaults to None.
    """
    conn = db_connect()

    with conn.cursor() as cursor:
        for model in models:
            # Convert the NodeModel to a dictionary and exclude where field, include values to update only
            if update_columns:
                model_dict = model.model_dump(mode="json",exclude_defaults=True, include=update_columns)
            else:
                model_dict = model.model_dump(mode="json",exclude_defaults=True)

            for key, value in model_dict.items():
                if type(value) == dict or type(value) == list:
                    model_dict[key] = json.dumps(value)
            
            where_value = model_dict[where_field]
            # print(where_value)
            del model_dict[where_field]

            # Prepare the column names and placeholders
            set_statements = ', '.join([f"{column} = %s" for column in model_dict.keys()])
            
            query = psycopg.sql.SQL("UPDATE {} SET {} WHERE {} = %s").format(
                psycopg.sql.Identifier(table_name),
                psycopg.sql.SQL(set_statements),
                psycopg.sql.Identifier(where_field)
            )
            # print(query.as_string(conn))
            # Execute the UPDATE statement
            cursor.execute(query, tuple(list(model_dict.values()) + [where_value]))
    conn.commit()
    conn.close

def regular_update(table_name: str, dicts: List[Any], where_field: str, update_columns: Optional[List[str]] = [] ):
    """
    Updates the specified table with the provided List of Dictionaries.

    Args:
        table_name (str): The name of the table to update.
        dicts (List[Dict[str, Any]]): The List of Dictionaries to use for the update.
        where_field (str): The field to use in the WHERE clause of the update statement.
        update_columns (Optional[List[str]]): The columns to include in the update. If None, all fields are included. Defaults to []
        user (Optional[str]): The user making the request
    """
    conn = db_connect()

    with conn.cursor() as cursor:
        for d in dicts:
            # exclude where field, include values to update only
            where_value = d[where_field]
            del d[where_field]

            for column in update_columns:
                if column not in d:
                    del d[column]

            for key, value in d.items():
                if type(value) == dict:
                    d[key] = json.dumps(value)
            
            

            # Prepare the column names and placeholders
            set_statements = ', '.join([f"{column} = %s" for column in d.keys()])
            
            query = psycopg.sql.SQL("UPDATE {} SET {} WHERE {} = %s").format(
                psycopg.sql.Identifier(table_name),
                psycopg.sql.SQL(set_statements),
                psycopg.sql.Identifier(where_field)
            )
            # print(query.as_string(conn))
            # Execute the UPDATE statement
            cursor.execute(query, tuple(list(d.values()) + [where_value]))
    conn.commit()
    conn.close


def pydantic_upsert(table_name: str, models: List[Any], where_field: str):
    """
    Performs an upsert operation on the specified table with the provided list of Pydantic Models.

    Args:
        table_name (str): The name of the table to upsert into.
        nodes (List[PydanticModels]): The list of pydantic models to use for the upsert.
        where_field (str): The field to use in the WHERE clause of the update statement.
         
    """
    for model in models:
        try:
            pydantic_insert(table_name=table_name, models=[model])
        except psycopg.errors.UniqueViolation as e:
            print(e)
            pydantic_update(table_name=table_name, models=[model], where_field=where_field)

def regular_upsert(table_name: str, dicts: List[Any], where_field: str):
    """
    Performs an upsert operation on the specified table with the provided list of dictionaries.

    Args:
        table_name (str): The name of the table to upsert into.
        dicts (List[Dict[str, Any]]): The list of dictionaries to use for the upsert.
        where_field (str): The field to use in the WHERE clause of the update statement.
        user (Optional[str]): The user making the request.
    """
    for d in dicts:
        try:
            regular_insert(table_name=table_name, dicts=[d])
        except psycopg.errors.UniqueViolation as e:
            regular_update(table_name=table_name, dicts=[d], where_field=where_field)


def upload_to_supabase(filepath, bucket_name, path_on_supabase):
    """
    Uploads a file to a specified bucket in Supabase and returns the public URL.

    Args:
    filepath (str): Path to the file on local disk.
    bucket_name (str): Name of the Supabase storage bucket.
    path_on_supabase (str): Path where the file will be stored in Supabase.

    Returns:
    dict: A dictionary containing the result status and URL or error message.
    """
    storage_url = f"{supabase_url}/storage/v1/object/public/{bucket_name}/{path_on_supabase}"
    try:
        with open(filepath, 'rb') as file:
            response = supabase.storage.from_(bucket_name).upload(file=file,path=path_on_supabase, file_options={"content-type": "image/jpeg"})
            print(response)
        
        
        
        return {'success': True, 'url': storage_url}
    except Exception as e:
        if "'error': 'Duplicate'" in str(e):
            return {'success': True, 'url': storage_url}
            
        return {'success': False, 'error': str(e)}





# ===== Cost Estimation Functions =====
def anthropic_estimate_tokens(prompt) -> int:
    """Returns the number of tokens in a text string."""
    count = anthropic_client.count_tokens(prompt)
    return count


def openai_estimate_tokens(string) -> int:
    """Returns the number of tokens in a text string."""
    encoding = tiktoken.get_encoding("cl100k_base")
    num_tokens = len(encoding.encode(string))
    return num_tokens



# ===== Async & Concurrent Functions =====
def run_concurrently(main_func: Callable, args_list: List[Any], batch_size: int, wait_time: Optional[int] = None):
    """
    Concurrently runs a function with a list of arguments in batches.
    Args:
        main_func (Callable): The function to run.
        args_list (List[Any]): The list of arguments to use for the function.
        batch_size (int): The number of arguments to include in each batch.
    Returns:
        List[Any]: The results of the function calls.
    """
    total_batches = math.ceil(len(args_list)/batch_size)
    print(f"=== Running {main_func.__name__} for {total_batches} batches of {batch_size} ===")
    results = []
    for i in range(0, len(args_list), batch_size):
        batch = args_list[i:i+batch_size]
        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = [executor.submit(main_func, *args) for args in batch]
        results.extend([future.result() for future in futures])
        print(f"=== Batch {int((i+batch_size)/batch_size)}/{total_batches} completed ===")
        if wait_time:
            time.sleep(wait_time)

    return results


# ==== XML Conversion Functions ====

# def parse_xml_to_model(xml_string: str, model_constructor: Type[BaseModel], output_tag: str = "output") -> Type[BaseModel]:
#     """
#     Read an xml string into the provided Pydantic Model. Model must be wrapped in <output_tag /> XML tags.

#     Args:
#         xml_string: A valid XML string representation, to be parsed.
#         model_constructor: A callable instance/Type of a Pydantic Model.
#     Returns:
#         An instance of the provided Pydantic Model, created from the parsed xml_string.
#     """

#     # Cut the start of the string to the start of "<output>"
#     try:
#         output_start = xml_string.index(f"<{output_tag}>")
#         output_end = xml_string.find(f"</{output_tag}>")
#         if output_end != -1:
#             output_end += len(f"</{output_tag}>")
#         xml_string = xml_string[output_start:output_end]
#     except:
#         raise ValueError(f"Param: xml_string must include '<{output_tag}></{output_tag}>' XML tags")
    
#     # Iterate through an unknown PydanticModel's fields and SubModels. Return a tuple of all fields which have a Type[List]
#     force_list_fn = find_list_fields(model_constructor)
#     #print(force_list_fn)
#     xml_dict = xmltodict.parse(xml_string, force_list=force_list_fn)[output_tag]
#     #print(xml_dict)
#     result_model: Type[BaseModel] = model_constructor.model_validate(xml_dict, strict=False)
#     return result_model

# def dump_model_to_xml(model: Type[BaseModel], indent_size: int = 2) -> str:
#     """
#     Dump a Pydantic Model into a valid XML string with indentation.

#     Args:
#         model: A Pydantic Model, to be dumped to XML.
#         indent_size: The size of indentation in number of spaces, defaulting to 2 spaces '  '
#     Returns:
#         A valid xml string representation of the dumped model.
#     """
    
#     model_dict: Dict[str, Any] = model.model_dump(exclude_none=True)
#     #print(model_dict)
    
#     # Convert the updated dictionary to an XML string.
#     xml = dict2xml.dict2xml(model_dict, indent ="  "*indent_size)
#     return xml


# def find_list_fields(model: Type[BaseModel]):
#     """Takes a Pydantic model and returns lambda function which finds fields that should be forced to lists."""
#     model_dict = model.model_json_schema()

#     root = ET.Element("tool_description")
#     tool_name = ET.SubElement(root, "tool_name")
#     tool_name.text = model_dict.get("title", "Unknown")
#     description = ET.SubElement(root, "description")
#     description.text = (
#         "This is the function that must be used to construct the response."
#     )
#     parameters = ET.SubElement(root, "parameters")
#     references = model_dict.get("$defs", {})
#     list_params = _add_params(parameters, model_dict, references)
#     lambda_func = create_force_list_checker(list_params)
#     return lambda_func


# def json_to_xml(model: Type[BaseModel]):
#     """Takes a Pydantic model and returns XML format for Anthropic function calling."""
#     model_dict = model.model_json_schema()

#     root = ET.Element("tool_description")
#     tool_name = ET.SubElement(root, "tool_name")
#     tool_name.text = model_dict.get("title", "Unknown")
#     description = ET.SubElement(root, "description")
#     description.text = (
#         "This is the function that must be used to construct the response."
#     )
#     parameters = ET.SubElement(root, "parameters")
#     references = model_dict.get("$defs", {})
#     list_params = _add_params(parameters, model_dict, references)
#     lambda_func = create_force_list_checker(list_params)
    


#     # Why not include the name of all parameters that need List?
#     if len(list_params) > 0:  # Need to append to system prompt for List type handling
#         return (
#             ET.tostring(root, encoding="unicode")
#             + "\nFor any List[] types, include multiple <$PARAMETER_NAME>$PARAMETER_VALUE</$PARAMETER_NAME> tags for each item in the list. XML tags should only contain the name of the parameter."
#         )
#     else:
#         return ET.tostring(root, encoding="unicode")



# # This code is from Instructor, full credit to them. :)
# def _add_params(root: ET.Element, model_dict: Dict[str, Any], references: Dict[str, Any], parent=None) -> List[Tuple[str, bool]]:  # Return value indiciates if we ever came across a param with type List
#     # TODO: handling of nested params with the same name
#     properties = model_dict.get("properties", {})
   
#     #print(f"Current properties: {model_dict}")
#     #print()
    
#     nested_list_found = False
    
#     list_params = []

#     for field_name, details in properties.items():
#         parameter = ET.SubElement(root, "parameter")
#         name = ET.SubElement(parameter, "name")
#         name.text = field_name
#         type_element = ET.SubElement(parameter, "type")
#         nested_model = None
#         #print(field_name)
#         #print(details)
#         #print()

#         # Get type
#         if "anyOf" in details:  # Case where there can be multiple types
#             # supports:
#             # case 1: List type (example json: {'anyOf': [{'items': {'$ref': '#/$defs/PartialUser'}, 'type': 'array'}, {'type': 'null'}], 'default': None, 'title': 'Users'})
#             # case 2: nested model (example json: {'anyOf': [{'$ref': '#/$defs/PartialDate'}, {'type': 'null'}], 'default': {}})
#             field_types = []
#             for d in details["anyOf"]:
#                 field_type = "unknown"
#                 if 'type' in d:
#                     field_type = d['type']
#                 if '$ref' in d:
#                     field_type = d['$ref']
#                     nested_model = d['$ref']

                
#             field_type = " or ".join(field_types)
#             #print(f"anyOf case: {field_type}")
#         else:
#             #print(f"Unknown case!")
#             field_type = details.get(
#                 "type", "unknown"
#             )  # Might be better to fail here if there is no type since pydantic models require types
        
#         if "array" in field_type and "items" not in details:
#             raise ValueError("Invalid array item.")

#         # Check for nested List
#         if "array" in field_type and "$ref" in details["items"]:
#             type_element.text = f"List[{details['title']}]"
            
#             nested_list_found = True 
#             list_params.append((field_name, parent))    
#         # Check for non-nested List
#         elif "array" in field_type and "type" in details["items"]:
#             type_element.text = f"List[{details['items']['type']}]"
            
#             list_params.append((field_name, None))
#         else:
#             type_element.text = field_type

#         param_description = ET.SubElement(parameter, "description")
#         param_description.text = details.get("description", "")

#         # Checking if there are nested params
#         #print(f"Isinstance(details, dict): {isinstance(details, dict)}")
#         #print(f"$ref in details: {'$ref' in details}")
#         if (isinstance(details, dict) and ("$ref" in details or nested_model is not None)):
#             if nested_model is not None:
#                 reference = _resolve_reference(references, nested_model)
#             else:
#                 reference = _resolve_reference(references, details["$ref"])
#             #print(f"Reference: {reference}")

#             if "enum" in reference:
#                 type_element.text = reference["type"]
#                 enum_values = reference["enum"]
#                 values = ET.SubElement(parameter, "values")
#                 for value in enum_values:
#                     value_element = ET.SubElement(values, "value")
#                     value_element.text = value
#                 continue

#             nested_params = ET.SubElement(parameter, "parameters")
#             list_params.extend(_add_params(
#                 nested_params,
#                 reference,
#                 references,
#                 parent=field_name
#             ))
#         elif field_type == "array" and nested_list_found:  # Handling for List[] type
#             nested_params = ET.SubElement(parameter, "parameters")
            
#             list_params.extend(_add_params(
#                 nested_params,
#                 _resolve_reference(references, details["items"]["$ref"]),
#                 references,
#                 parent=field_name,
#             ))

#     return list_params


# def _resolve_reference(references: Dict[str, Any], reference: str) -> Dict[str, Any]:
#     parts = reference.split("/")[2:]  # Remove "#" and "$defs"
#     for part in parts:
#         references = references[part]
#     return references


# # I wrote this :)
# def create_force_list_checker(list_params: List[Tuple[str, Optional[str]]]) -> Callable[[List[Tuple[str, Any]], str, Any], bool]:
#     """
#     Creates a lambda function that determines if a given element, identified by a key and its position
#     in a path, should be forced into a list. The decision is based on predefined (key, parentName) pairs.

#     Args:
#         list_params: A list of tuples, where each tuple contains (keyName, parentName),
#                      specifying when an element should be forced into a list.

#     Returns:
#         A lambda function that checks if an element, based on its key and parent in the path,
#         matches one of the specified conditions to be forced into a list.
#     """
#     return lambda path, key, value: any(
#         key == keyName and (path and path[-1][0] == parentName if parentName else True)
#         for keyName, parentName in list_params
#     )


# def json_to_xml_instructor(model: Type[BaseModel]) -> str:
#     """Takes a Pydantic model and returns XML format for Anthropic function calling."""
#     model_dict = model.model_json_schema()

#     root = ET.Element("tool_description")
#     tool_name = ET.SubElement(root, "tool_name")
#     tool_name.text = model_dict.get("title", "Unknown")
#     description = ET.SubElement(root, "description")
#     description.text = (
#         "This is the function that must be used to construct the response."
#     )
#     parameters = ET.SubElement(root, "parameters")
#     references = model_dict.get("$defs", {})
#     list_type_found = _add_params_instructor(parameters, model_dict, references)

#     if list_type_found:  # Need to append to system prompt for List type handling
#         return (
#             ET.tostring(root, encoding="unicode")
#             + "\nFor any List[] types, include multiple <$PARAMETER_NAME>$PARAMETER_VALUE</$PARAMETER_NAME> tags for each item in the list. XML tags should only contain the name of the parameter."
#         )
#     else:
#         return ET.tostring(root, encoding="unicode")


# def _add_params_instructor(
#     root: ET.Element, model_dict: Dict[str, Any], references: Dict[str, Any]
# ) -> bool:  # Return value indiciates if we ever came across a param with type List
#     # TODO: handling of nested params with the same name
#     properties = model_dict.get("properties", {})
#     list_found = False
#     nested_list_found = False

#     for field_name, details in properties.items():
#         parameter = ET.SubElement(root, "parameter")
#         name = ET.SubElement(parameter, "name")
#         name.text = field_name
#         type_element = ET.SubElement(parameter, "type")

#         # Get type
#         if "anyOf" in details:  # Case where there can be multiple types
#             # supports:
#             # case 1: List type (example json: {'anyOf': [{'items': {'$ref': '#/$defs/PartialUser'}, 'type': 'array'}, {'type': 'null'}], 'default': None, 'title': 'Users'})
#             # case 2: nested model (example json: {'anyOf': [{'$ref': '#/$defs/PartialDate'}, {'type': 'null'}], 'default': {}})
#             field_type = " or ".join(
#                 [
#                     d["type"]
#                     if "type" in d
#                     else (d["$ref"] if "$ref" in d else "unknown")
#                     for d in details["anyOf"]
#                 ]
#             )
#         else:
#             field_type = details.get(
#                 "type", "unknown"
#             )  # Might be better to fail here if there is no type since pydantic models require types
        
#         if "array" in field_type and "items" not in details:
#             raise ValueError("Invalid array item.")

#         # Check for nested List
#         if "array" in field_type and "$ref" in details["items"]:
#             type_element.text = f"List[{details['title']}]"
#             list_found = True
#             nested_list_found = True     
#         # Check for non-nested List
#         elif "array" in field_type and "type" in details["items"]:
#             type_element.text = f"List[{details['items']['type']}]"
#             list_found = True
#         else:
#             type_element.text = field_type

#         param_description = ET.SubElement(parameter, "description")
#         param_description.text = details.get("description", "")

#         if (
#             isinstance(details, dict) and "$ref" in details
#         ):  # Checking if there are nested params
#             reference = _resolve_reference(references, details["$ref"])

#             if "enum" in reference:
#                 type_element.text = reference["type"]
#                 enum_values = reference["enum"]
#                 values = ET.SubElement(parameter, "values")
#                 for value in enum_values:
#                     value_element = ET.SubElement(values, "value")
#                     value_element.text = value
#                 continue

#             nested_params = ET.SubElement(parameter, "parameters")
#             list_found |= _add_params_instructor(
#                 nested_params,
#                 reference,
#                 references,
#             )
#         elif field_type == "array" and nested_list_found:  # Handling for List[] type
#             nested_params = ET.SubElement(parameter, "parameters")
#             list_found |= _add_params_instructor(
#                 nested_params,
#                 _resolve_reference(references, details["items"]["$ref"]),
#                 references,
#             )

#     return list_found




if __name__ == "__main__":
    main()



