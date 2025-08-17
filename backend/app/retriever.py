"""
Document retrieval system for FarmGuru using Supabase pgvector.
"""
from typing import List, Dict, Any, Optional
from .db import db
from .embeddings import embedding_service

class DocumentRetriever:
    def __init__(self):
        pass
        
    async def retrieve_docs(self, query: str, limit: int = 3) -> List[Dict[str, Any]]:
        """Retrieve relevant documents for a query using vector similarity"""
        try:
            # Get query embedding
            query_embedding = await embedding_service.get_embedding(query)
            
            # Use pgvector for similarity search if available
            try:
                docs = await self._vector_search(query_embedding, limit)
                if docs:
                    return docs
            except Exception as e:
                print(f"Vector search failed: {e}")
                
            # Fallback to text-based search
            return await self._text_search(query, limit)
            
        except Exception as e:
            print(f"Retrieval error: {e}")
            return []
            
    async def _vector_search(self, query_embedding: List[float], limit: int) -> List[Dict[str, Any]]:
        """Search using pgvector similarity"""
        query = """
        SELECT id, title, content, source_url,
               1 - (embedding <=> $1) as similarity
        FROM docs 
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> $1
        LIMIT $2
        """
        
        docs = await db.fetch_all(query, query_embedding, limit)
        
        # Filter by minimum similarity threshold
        filtered_docs = [doc for doc in docs if doc.get('similarity', 0) > 0.3]
        
        return filtered_docs
        
    async def _text_search(self, query: str, limit: int) -> List[Dict[str, Any]]:
        """Fallback text-based search using PostgreSQL full-text search"""
        query_sql = """
        SELECT id, title, content, source_url,
               ts_rank(to_tsvector('english', title || ' ' || content), 
                       plainto_tsquery('english', $1)) as rank
        FROM docs
        WHERE to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', $1)
        ORDER BY rank DESC
        LIMIT $2
        """
        
        return await db.fetch_all(query_sql, query, limit)
        
    async def add_document(self, title: str, content: str, source_url: Optional[str] = None) -> str:
        """Add a new document to the corpus with embedding"""
        try:
            # Generate embedding for the content
            embedding = await embedding_service.get_embedding(content)
            
            # Insert document
            query = """
            INSERT INTO docs (title, content, source_url, embedding)
            VALUES ($1, $2, $3, $4)
            RETURNING id
            """
            
            result = await db.fetch_one(query, title, content, source_url, embedding)
            return result['id'] if result else None
            
        except Exception as e:
            print(f"Error adding document: {e}")
            return None

# Global retriever instance
retriever = DocumentRetriever()