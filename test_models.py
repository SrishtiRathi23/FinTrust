import os
from google import genai
from google.genai.errors import ClientError
from dotenv import load_dotenv

load_dotenv('backend/.env')
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))
models = client.models.list()

for m in models:
    if "gemini" in m.name:
        try:
            r = client.models.generate_content(model=m.name, contents='ping')
            print(f'{m.name}: SUCCESS')
        except Exception as e:
            err_msg = getattr(e, 'message', str(e))
            print(f'{m.name}: FAILED')
