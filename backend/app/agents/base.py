from openai import OpenAI

from app.config import settings


class BaseAgent:
    name: str = ""
    system_prompt: str = ""
    max_tokens: int = 1000

    def __init__(self):
        self.client = OpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url,
        )
        self.model = settings.openai_model

    def analyze(self, thought: dict) -> str:
        user_prompt = f"""Título: {thought['title']}
Tese: {thought['claim']}
Evidências: {thought.get('evidence', '')}
Raciocínio: {thought.get('reasoning', '')}
Conclusão: {thought.get('conclusion', '')}"""

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=self.max_tokens,
        )
        return response.choices[0].message.content or ""
