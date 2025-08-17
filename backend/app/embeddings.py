"""
Embedding utilities for FarmGuru - handles both OpenAI and local embeddings.
"""
import os
import openai
import numpy as np
from typing import List, Optional
from sentence_transformers import SentenceTransformer

class EmbeddingService:
    def __init__(self):
        self.openai_client = None
        self.local_model = None
        self.embedding_dim = 1536  # Default to OpenAI dimension
        
        # Initialize OpenAI if API key is available
        if os.getenv("OPENAI_API_KEY"):
            self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            
        # Initialize local model as fallback
        try:
            self.local_model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
            if not self.openai_client:
                self.embedding_dim = 384  # Local model dimension
        except Exception as e:
            print(f"Warning: Could not load local embedding model: {e}")
            
    async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Get embeddings for list of texts using OpenAI or local model"""
        if self.openai_client:
            return await self._get_openai_embeddings(texts)
        elif self.local_model:
            return self._get_local_embeddings(texts)
        else:
            # Fallback: return zero vectors
            return [[0.0] * self.embedding_dim for _ in texts]
            
    async def get_embedding(self, text: str) -> List[float]:
        """Get embedding for single text"""
        embeddings = await self.get_embeddings([text])
        return embeddings[0]
        
    async def _get_openai_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Get embeddings using OpenAI API"""
        try:
            response = await self.openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=texts
            )
            return [embedding.embedding for embedding in response.data]
        except Exception as e:
            print(f"OpenAI embedding error: {e}")
            # Fallback to local model if available
            if self.local_model:
                return self._get_local_embeddings(texts)
            return [[0.0] * self.embedding_dim for _ in texts]
            
    def _get_local_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Get embeddings using local sentence-transformers model"""
        try:
            embeddings = self.local_model.encode(texts)
            return embeddings.tolist()
        except Exception as e:
            print(f"Local embedding error: {e}")
            return [[0.0] * self.embedding_dim for _ in texts]
            
    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        v1 = np.array(vec1)
        v2 = np.array(vec2)
        
        if np.linalg.norm(v1) == 0 or np.linalg.norm(v2) == 0:
            return 0.0
            
        return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

# Global embedding service instance
embedding_service = EmbeddingService()