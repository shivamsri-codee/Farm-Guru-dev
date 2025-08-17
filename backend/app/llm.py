"""
LLM service for FarmGuru with OpenAI integration and deterministic fallback.
"""
import os
import json
import openai
from typing import List, Dict, Any, Optional

class LLMService:
    def __init__(self):
        self.openai_client = None
        if os.getenv("OPENAI_API_KEY"):
            self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            
    async def synthesize(self, question: str, docs: List[Dict[str, Any]], agent_hint: str = "general") -> Dict[str, Any]:
        """Synthesize answer from retrieved documents"""
        if not docs:
            return {
                "answer": "I don't know — please consult a local expert.",
                "confidence": 0.0,
                "actions": ["Ask a local agricultural expert"],
                "sources": [],
                "meta": {"agent": agent_hint, "retrieved_ids": []}
            }
            
        # Load prompt template
        prompt_template = self._load_prompt_template()
        
        # Format documents for prompt
        doc_text = self._format_docs_for_prompt(docs)
        
        # Create full prompt
        full_prompt = prompt_template.replace("<<USER_QUESTION>>", question)
        full_prompt += f"\nRetrieved docs:\n{doc_text}\n\nReturn only JSON."
        
        # Try OpenAI first, then fallback
        if self.openai_client:
            try:
                response = await self._call_openai(full_prompt)
                parsed_response = self._parse_and_validate_response(response, docs, agent_hint)
                if parsed_response:
                    return parsed_response
            except Exception as e:
                print(f"OpenAI API error: {e}")
                
        # Deterministic fallback
        return self._deterministic_fallback(question, docs, agent_hint)
        
    def _load_prompt_template(self) -> str:
        """Load the RAG prompt template"""
        try:
            with open("prompt_templates/rag_prompt.txt", "r") as f:
                return f.read()
        except FileNotFoundError:
            return """You are FarmGuru. Use ONLY the retrieved passages below (labeled [DOC1],[DOC2]...[DOCn]). Do NOT invent facts. If none of the passages support the user's question, reply exactly: "I don't know — please consult a local expert." Output must be strict JSON with fields: answer (short 1-2 sentences), confidence (0-1), actions (array of 1-3 concise actions), sources (array with title,url,snippet). For chemistry/chemical suggestions: do NOT provide dosages or prescriptive application guidance—only broad IPM steps and advise to consult local extension.
User question: <<USER_QUESTION>>"""
            
    def _format_docs_for_prompt(self, docs: List[Dict[str, Any]]) -> str:
        """Format documents for the prompt"""
        formatted_docs = []
        for i, doc in enumerate(docs, 1):
            title = doc.get('title', 'Unknown')
            url = doc.get('source_url', 'No URL')
            content = doc.get('content', '')[:500]  # Truncate for token limits
            
            formatted_docs.append(f"[DOC{i}] Title: {title}, URL: {url}\n{content}")
            
        return "\n\n".join(formatted_docs)
        
    async def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API"""
        response = await self.openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are FarmGuru, an agricultural assistant. Always return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.0,
            max_tokens=1000
        )
        
        return response.choices[0].message.content
        
    def _parse_and_validate_response(self, response: str, docs: List[Dict[str, Any]], agent_hint: str) -> Optional[Dict[str, Any]]:
        """Parse and validate LLM response"""
        try:
            # Try to extract JSON from response
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.endswith("```"):
                response = response[:-3]
                
            parsed = json.loads(response)
            
            # Validate required fields
            required_fields = ["answer", "confidence", "actions", "sources"]
            if not all(field in parsed for field in required_fields):
                return None
                
            # Add metadata
            parsed["meta"] = {
                "agent": agent_hint,
                "retrieved_ids": [doc.get('id') for doc in docs if doc.get('id')]
            }
            
            return parsed
            
        except (json.JSONDecodeError, KeyError) as e:
            print(f"Response parsing error: {e}")
            return None
            
    def _deterministic_fallback(self, question: str, docs: List[Dict[str, Any]], agent_hint: str) -> Dict[str, Any]:
        """Deterministic fallback when OpenAI is not available"""
        # Simple rule-based response generation
        if not docs:
            answer = "I don't know — please consult a local expert."
            confidence = 0.0
            actions = ["Consult local agricultural extension officer"]
        else:
            # Concatenate top snippets
            snippets = [doc.get('content', '')[:200] for doc in docs[:2]]
            combined_content = " ".join(snippets)
            
            # Generate conservative answer based on content
            if any(keyword in question.lower() for keyword in ['water', 'irrigat', 'rain']):
                answer = "Check soil moisture at 2-3 inch depth before watering."
                actions = ["Check soil moisture", "Monitor weather forecast", "Water early morning if needed"]
                confidence = 0.7
            elif any(keyword in question.lower() for keyword in ['pest', 'disease', 'bug']):
                answer = "Consider Integrated Pest Management (IPM) approaches and consult local experts."
                actions = ["Remove affected plant parts", "Use neem-based treatments", "Consult KVK expert"]
                confidence = 0.5
            elif any(keyword in question.lower() for keyword in ['fertilizer', 'nutrient']):
                answer = "Conduct soil test first, then apply balanced fertilizers as recommended."
                actions = ["Get soil test done", "Apply in morning", "Follow recommended dosage"]
                confidence = 0.6
            else:
                answer = combined_content[:100] + "... Please consult local experts for specific guidance."
                actions = ["Consult agricultural extension officer", "Visit nearest KVK"]
                confidence = 0.4
                
        # Format sources
        sources = []
        for doc in docs:
            sources.append({
                "title": doc.get('title', 'Agricultural Guide'),
                "url": doc.get('source_url', '#'),
                "snippet": doc.get('content', '')[:150]
            })
            
        return {
            "answer": answer,
            "confidence": confidence,
            "actions": actions,
            "sources": sources,
            "meta": {
                "agent": agent_hint,
                "retrieved_ids": [doc.get('id') for doc in docs if doc.get('id')]
            }
        }

# Global LLM service instance
llm_service = LLMService()