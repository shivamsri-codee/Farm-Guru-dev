"""
Community service for FarmGuru - manages farmer community posts and interactions.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from .db import db

class CommunityService:
    def __init__(self):
        pass
        
    async def create_post(self, user_id: str, title: str, body: str, tags: List[str]) -> Dict[str, Any]:
        """Create a new community post"""
        try:
            # Basic content moderation
            if self._needs_moderation(title, body):
                moderated = False
            else:
                moderated = True
                
            query = """
            INSERT INTO community_posts (user_id, title, body, tags, moderated)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, created_at
            """
            
            result = await db.execute(query, user_id, title, body, tags, moderated)
            
            if result:
                return {
                    "success": True,
                    "post_id": result.get('id'),
                    "moderated": moderated,
                    "message": "Post created successfully" if moderated else "Post created and sent for moderation"
                }
            else:
                return {"success": False, "error": "Failed to create post"}
                
        except Exception as e:
            print(f"Community post creation error: {e}")
            return {"success": False, "error": str(e)}
            
    async def get_posts(self, limit: int = 20, offset: int = 0, tags: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Get community posts with optional tag filtering"""
        try:
            base_query = """
            SELECT cp.id, cp.title, cp.body, cp.tags, cp.created_at, cp.moderated,
                   u.name as author_name, u.state as author_state
            FROM community_posts cp
            LEFT JOIN users u ON cp.user_id = u.id
            WHERE cp.moderated = true
            """
            
            params = []
            if tags:
                base_query += " AND cp.tags && $1"
                params.append(tags)
                
            base_query += " ORDER BY cp.created_at DESC LIMIT $%d OFFSET $%d" % (len(params) + 1, len(params) + 2)
            params.extend([limit, offset])
            
            posts = await db.fetch_all(base_query, *params)
            
            # Format posts
            formatted_posts = []
            for post in posts:
                formatted_posts.append({
                    "id": post['id'],
                    "title": post['title'],
                    "body": post['body'],
                    "tags": post['tags'],
                    "created_at": post['created_at'].isoformat(),
                    "author": {
                        "name": post['author_name'] or "Anonymous",
                        "state": post['author_state']
                    }
                })
                
            return formatted_posts
            
        except Exception as e:
            print(f"Community posts retrieval error: {e}")
            return []
            
    async def get_post_by_id(self, post_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific post by ID"""
        try:
            query = """
            SELECT cp.id, cp.title, cp.body, cp.tags, cp.created_at, cp.moderated,
                   u.name as author_name, u.state as author_state, u.village as author_village
            FROM community_posts cp
            LEFT JOIN users u ON cp.user_id = u.id
            WHERE cp.id = $1 AND cp.moderated = true
            """
            
            post = await db.fetch_one(query, post_id)
            
            if post:
                return {
                    "id": post['id'],
                    "title": post['title'],
                    "body": post['body'],
                    "tags": post['tags'],
                    "created_at": post['created_at'].isoformat(),
                    "author": {
                        "name": post['author_name'] or "Anonymous",
                        "state": post['author_state'],
                        "village": post['author_village']
                    }
                }
                
            return None
            
        except Exception as e:
            print(f"Post retrieval error: {e}")
            return None
            
    async def update_post(self, post_id: str, user_id: str, title: str, body: str, tags: List[str]) -> Dict[str, Any]:
        """Update a post (only by the author)"""
        try:
            # Check if user owns the post
            check_query = "SELECT user_id FROM community_posts WHERE id = $1"
            post_owner = await db.fetch_one(check_query, post_id)
            
            if not post_owner or post_owner['user_id'] != user_id:
                return {"success": False, "error": "Unauthorized to edit this post"}
                
            # Update post
            moderated = not self._needs_moderation(title, body)
            
            update_query = """
            UPDATE community_posts 
            SET title = $2, body = $3, tags = $4, moderated = $5
            WHERE id = $1 AND user_id = $6
            """
            
            await db.execute(update_query, post_id, title, body, tags, moderated, user_id)
            
            return {
                "success": True,
                "moderated": moderated,
                "message": "Post updated successfully" if moderated else "Post updated and sent for moderation"
            }
            
        except Exception as e:
            print(f"Post update error: {e}")
            return {"success": False, "error": str(e)}
            
    async def delete_post(self, post_id: str, user_id: str) -> Dict[str, Any]:
        """Delete a post (only by the author)"""
        try:
            query = "DELETE FROM community_posts WHERE id = $1 AND user_id = $2"
            result = await db.execute(query, post_id, user_id)
            
            if "DELETE 1" in result:
                return {"success": True, "message": "Post deleted successfully"}
            else:
                return {"success": False, "error": "Post not found or unauthorized"}
                
        except Exception as e:
            print(f"Post deletion error: {e}")
            return {"success": False, "error": str(e)}
            
    def _needs_moderation(self, title: str, body: str) -> bool:
        """Basic content moderation - returns True if content needs manual review"""
        # Simple keyword-based moderation
        flagged_keywords = [
            'spam', 'scam', 'fraud', 'fake', 'cheat',
            'sell', 'buy', 'money', 'cash', 'loan'
        ]
        
        content = (title + " " + body).lower()
        
        # Flag if contains multiple flagged keywords
        flag_count = sum(1 for keyword in flagged_keywords if keyword in content)
        
        return flag_count >= 2
        
    async def get_popular_tags(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get most popular tags in community posts"""
        try:
            query = """
            SELECT tag, COUNT(*) as count
            FROM (
                SELECT unnest(tags) as tag
                FROM community_posts
                WHERE moderated = true
            ) t
            GROUP BY tag
            ORDER BY count DESC
            LIMIT $1
            """
            
            results = await db.fetch_all(query, limit)
            
            return [{"tag": result['tag'], "count": result['count']} for result in results]
            
        except Exception as e:
            print(f"Popular tags error: {e}")
            return []

# Global community service instance
community_service = CommunityService()