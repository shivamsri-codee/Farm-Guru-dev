"""
LLM service for FarmGuru with OpenAI integration and deterministic fallback.
"""
import os
import json
import httpx
from typing import List, Dict, Any, Optional

class LLMService:
    def __init__(self):
        self.hf_api_key = os.getenv("HF_API_KEY")
        self.hf_model = os.getenv("HF_MODEL", "HuggingFaceH4/zephyr-7b-beta")
        self.hf_url = f"https://api-inference.huggingface.co/models/{self.hf_model}"
            
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
        
        # Try Hugging Face first, then fallback
        if self.hf_api_key:
            try:
                response = await self._call_huggingface(full_prompt)
                parsed_response = self._parse_and_validate_response(response, docs, agent_hint)
                if parsed_response:
                    return parsed_response
            except Exception as e:
                print(f"Hugging Face API error: {e}")
                
        # Deterministic fallback
        return self._deterministic_fallback(question, docs, agent_hint)
        
    async def generate_answer(self, prompt_text: str) -> str:
        """Generate answer using Hugging Face Inference API with fallback"""
        if self.hf_api_key:
            try:
                return await self._call_huggingface_direct(prompt_text)
            except Exception as e:
                print(f"HF API error: {e}")
                
        # Deterministic fallback
        return f"(Demo mode) {prompt_text[:100]}... Please consult local agricultural experts for specific guidance."
        
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
        
    async def _call_huggingface(self, prompt: str) -> str:
        """Call Hugging Face Inference API"""
        return await self._call_huggingface_direct(prompt)
        
    async def _call_huggingface_direct(self, prompt: str) -> str:
        """Direct call to Hugging Face API with retry logic"""
        headers = {
            "Authorization": f"Bearer {self.hf_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 256,
                "temperature": 0.2
            }
        }
        
        # Retry logic for 503/429 errors
        for attempt in range(3):
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(self.hf_url, headers=headers, json=payload, timeout=30.0)
                    
                    if response.status_code == 200:
                        data = response.json()
                        
                        # Parse response format
                        if isinstance(data, list) and len(data) > 0:
                            if "generated_text" in data[0]:
                                print("LLM path: hf_api")
                                return data[0]["generated_text"]
                        elif isinstance(data, dict):
                            if "error" in data:
                                if "gated" in data["error"].lower() or "403" in str(response.status_code):
                                    print(f"HF Model gated: Visit {self.hf_url} and accept terms")
                                raise Exception(f"HF API error: {data['error']}")
                            if "generated_text" in data:
                                print("LLM path: hf_api")
                                return data["generated_text"]
                                
                        raise Exception("Unexpected response format")
                        
                    elif response.status_code in [503, 429]:
                        if attempt < 2:  # Retry for 503/429
                            await asyncio.sleep(1 + attempt)
                            continue
                        else:
                            raise Exception(f"HF API unavailable: {response.status_code}")
                    else:
                        raise Exception(f"HF API error: {response.status_code}")
                        
            except Exception as e:
                if attempt == 2:  # Last attempt
                    raise e
                await asyncio.sleep(1)
        
        raise Exception("Max retries exceeded")
        
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
        """Deterministic fallback when Hugging Face is not available"""
        print("LLM path: deterministic_fallback")
        
        # Simple rule-based response generation
        if not docs:
            answer = "(Demo mode) I don't know — please consult a local expert."
            confidence = 0.0
            actions = ["Consult local agricultural extension officer"]
        else:
            # Concatenate top snippets
            snippets = [doc.get('content', '')[:200] for doc in docs[:2]]
            combined_content = " ".join(snippets)
            
            # Generate conservative answer based on content
            if any(keyword in question.lower() for keyword in ['water', 'irrigat', 'rain']):
                answer = "(Demo mode) Check soil moisture at 2-3 inch depth before watering."
                actions = ["Check soil moisture", "Monitor weather forecast", "Water early morning if needed"]
                confidence = 0.7
            elif any(keyword in question.lower() for keyword in ['pest', 'disease', 'bug']):
                answer = "(Demo mode) Consider Integrated Pest Management (IPM) approaches and consult local experts."
                actions = ["Remove affected plant parts", "Use neem-based treatments", "Consult KVK expert"]
                confidence = 0.5
            elif any(keyword in question.lower() for keyword in ['fertilizer', 'nutrient']):
                answer = "(Demo mode) Conduct soil test first, then apply balanced fertilizers as recommended."
                actions = ["Get soil test done", "Apply in morning", "Follow recommended dosage"]
                confidence = 0.6
            else:
                answer = "(Demo mode) " + combined_content[:100] + "... Please consult local experts for specific guidance."
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