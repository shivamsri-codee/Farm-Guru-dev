"""
Database connection and utilities for FarmGuru backend.
"""
import asyncpg
import os
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

class Database:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
        
    async def connect(self):
        """Initialize database connection pool"""
        database_url = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL")
        if not database_url:
            raise ValueError("DATABASE_URL or SUPABASE_DB_URL environment variable is required")
            
        self.pool = await asyncpg.create_pool(
            database_url,
            min_size=1,
            max_size=10
        )
        
    async def disconnect(self):
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
            
    @asynccontextmanager
    async def get_connection(self):
        """Get database connection from pool"""
        if not self.pool:
            await self.connect()
        async with self.pool.acquire() as connection:
            yield connection
            
    async def fetch_one(self, query: str, *args) -> Optional[Dict[str, Any]]:
        """Fetch single row"""
        async with self.get_connection() as conn:
            row = await conn.fetchrow(query, *args)
            return dict(row) if row else None
            
    async def fetch_all(self, query: str, *args) -> List[Dict[str, Any]]:
        """Fetch multiple rows"""
        async with self.get_connection() as conn:
            rows = await conn.fetch(query, *args)
            return [dict(row) for row in rows]
            
    async def execute(self, query: str, *args) -> str:
        """Execute query and return status"""
        async with self.get_connection() as conn:
            return await conn.execute(query, *args)
            
    async def execute_many(self, query: str, args_list: List[tuple]) -> None:
        """Execute query multiple times with different parameters"""
        async with self.get_connection() as conn:
            await conn.executemany(query, args_list)

# Global database instance
db = Database()