
from pydanticModels import APIParameters, APIUsage, ChatMessage, DailyBlog, DaveResponse
from typing import List
import utilityFunctions as util
import uuid
import json
import os
DIR = os.path.dirname(os.path.realpath(__file__))

def main():
    build_blog_from_json()


def build_blog_from_json():
    with open(f"{DIR}/blog.json") as json_data:
        text = json_data.read()
    blog_dct = json.loads(text)
    model = DailyBlog(**blog_dct)
    print(model)
    util.pydantic_insert("daily_blogs", [model])

if __name__ == "__main__":
    main()