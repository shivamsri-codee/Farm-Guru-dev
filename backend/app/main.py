"""
FarmGuru FastAPI backend with Supabase integration.
"""
import os
import asyncio
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import aiofiles
import uuid
from datetime import datetime

from .db import db
from .retriever import retriever
from .llm import llm_service
from .weather import weather_service
from .market import market_service
from .policy_matcher import policy_matcher
from .chem_reco import chem_reco_service
from .community import community_service
from .seed_supabase import SupabaseSeeder

# Pydantic models
class QueryRequest(BaseModel):
    user_id: Optional[str] = None
    text: Optional[str] = None
    lang: str = "en"
    image_id: Optional[str] = None

class PolicyMatchRequest(BaseModel):
    user_id: Optional[str] = None
    state: str
    crop: str

class ChemRecoRequest(BaseModel):
    crop: str
    symptom: str
    image_id: Optional[str] = None
    user_id: Optional[str] = None

class CommunityPostRequest(BaseModel):
    user_id: str
    title: str
    body: str
    tags: List[str] = []

class CommunityUpdateRequest(BaseModel):
    title: str
    body: str
    tags: List[str] = []

# Initialize FastAPI app
app = FastAPI(title="FarmGuru API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploaded images
os.makedirs("app/static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    await db.connect()

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    await db.disconnect()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "FarmGuru API is running", "status": "healthy"}

@app.post("/api/seed")
async def seed_database():
    """Seed the database with initial data"""
    try:
        seeder = SupabaseSeeder()
        await seeder.seed_all()
        return {"success": True, "message": "Database seeded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Seeding failed: {str(e)}")

@app.post("/api/query")
async def query_endpoint(request: QueryRequest) -> Dict[str, Any]:
    """Main query endpoint for agricultural questions"""
    try:
        if not request.text and not request.image_id:
            raise HTTPException(status_code=400, detail="Either text or image_id is required")
            
        # Prepare query text
        query_text = request.text or ""
        
        # If image_id provided, add image context
        if request.image_id:
            # Get image metadata from database
            image_query = "SELECT label, confidence FROM images WHERE id = $1"
            image_data = await db.fetch_one(image_query, request.image_id)
            if image_data and image_data['label']:
                query_text += f" Image shows: {image_data['label']}"
        
        if not query_text.strip():
            raise HTTPException(status_code=400, detail="No valid query text or image data")
            
        # Determine agent type based on query content
        agent_hint = _determine_agent_type(query_text)
        
        # Retrieve relevant documents
        docs = await retriever.retrieve_docs(query_text, limit=3)
        
        # Generate response using LLM
        response = await llm_service.synthesize(query_text, docs, agent_hint)
        
        # Log query if user_id provided
        if request.user_id:
            await _log_query(request.user_id, query_text, agent_hint, response)
            
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Query endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    user_id: Optional[str] = Form(None)
) -> Dict[str, Any]:
    """Upload and analyze crop image"""
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
            
        # Generate unique filename
        image_id = str(uuid.uuid4())
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        filename = f"{image_id}.{file_extension}"
        file_path = f"app/static/uploads/{filename}"
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
            
        # TODO: Replace with actual image analysis model
        # For now, return stubbed analysis
        label, confidence = _analyze_image_stub(filename)
        
        # Save image metadata to database
        storage_path = f"/static/uploads/{filename}"
        query = """
        INSERT INTO images (id, user_id, filename, storage_path, label, confidence)
        VALUES ($1, $2, $3, $4, $5, $6)
        """
        await db.execute(query, image_id, user_id, filename, storage_path, label, confidence)
        
        return {
            "image_id": image_id,
            "label": label,
            "confidence": confidence,
            "url": storage_path
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Image upload error: {e}")
        raise HTTPException(status_code=500, detail="Image upload failed")

@app.get("/api/weather")
async def get_weather(state: str, district: str) -> Dict[str, Any]:
    """Get weather forecast for specified location"""
    try:
        weather_data = await weather_service.get_weather(state, district)
        return weather_data
    except Exception as e:
        print(f"Weather endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Weather data unavailable")

@app.get("/api/market")
async def get_market(commodity: str, mandi: str) -> Dict[str, Any]:
    """Get market prices and analysis for specified commodity"""
    try:
        market_data = await market_service.get_market_data(commodity, mandi)
        return market_data
    except Exception as e:
        print(f"Market endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Market data unavailable")

@app.post("/api/policy-match")
async def policy_match(request: PolicyMatchRequest) -> Dict[str, Any]:
    """Match user with applicable government schemes"""
    try:
        policy_data = await policy_matcher.match_policies(
            request.user_id, 
            request.state, 
            request.crop
        )
        return policy_data
    except Exception as e:
        print(f"Policy match error: {e}")
        raise HTTPException(status_code=500, detail="Policy matching failed")

@app.post("/api/chem-reco")
async def chemical_recommendation(request: ChemRecoRequest) -> Dict[str, Any]:
    """Get safe chemical/treatment recommendations"""
    try:
        recommendation = await chem_reco_service.get_recommendation(
            request.crop,
            request.symptom,
            request.image_id,
            request.user_id
        )
        return recommendation
    except Exception as e:
        print(f"Chemical recommendation error: {e}")
        raise HTTPException(status_code=500, detail="Recommendation service unavailable")

@app.post("/api/community/post")
async def create_community_post(request: CommunityPostRequest) -> Dict[str, Any]:
    """Create a new community post"""
    try:
        result = await community_service.create_post(
            request.user_id,
            request.title,
            request.body,
            request.tags
        )
        return result
    except Exception as e:
        print(f"Community post creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create post")

@app.get("/api/community/list")
async def list_community_posts(
    limit: int = 20,
    offset: int = 0,
    tags: Optional[str] = None
) -> Dict[str, Any]:
    """Get list of community posts"""
    try:
        tag_list = tags.split(",") if tags else None
        posts = await community_service.get_posts(limit, offset, tag_list)
        return {"posts": posts, "total": len(posts)}
    except Exception as e:
        print(f"Community posts retrieval error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve posts")

@app.get("/api/community/post/{post_id}")
async def get_community_post(post_id: str) -> Dict[str, Any]:
    """Get a specific community post"""
    try:
        post = await community_service.get_post_by_id(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        return post
    except HTTPException:
        raise
    except Exception as e:
        print(f"Community post retrieval error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve post")

@app.put("/api/community/post/{post_id}")
async def update_community_post(
    post_id: str, 
    request: CommunityUpdateRequest,
    user_id: str
) -> Dict[str, Any]:
    """Update a community post"""
    try:
        result = await community_service.update_post(
            post_id, user_id, request.title, request.body, request.tags
        )
        return result
    except Exception as e:
        print(f"Community post update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update post")

@app.delete("/api/community/post/{post_id}")
async def delete_community_post(post_id: str, user_id: str) -> Dict[str, Any]:
    """Delete a community post"""
    try:
        result = await community_service.delete_post(post_id, user_id)
        return result
    except Exception as e:
        print(f"Community post deletion error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete post")

@app.get("/api/community/tags")
async def get_popular_tags() -> Dict[str, Any]:
    """Get popular community tags"""
    try:
        tags = await community_service.get_popular_tags()
        return {"tags": tags}
    except Exception as e:
        print(f"Popular tags error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve tags")

# Helper functions
def _determine_agent_type(query_text: str) -> str:
    """Determine which agent should handle the query"""
    query_lower = query_text.lower()
    
    if any(keyword in query_lower for keyword in ['weather', 'rain', 'forecast', 'temperature']):
        return "weather"
    elif any(keyword in query_lower for keyword in ['price', 'market', 'sell', 'buy', 'mandi']):
        return "market"
    elif any(keyword in query_lower for keyword in ['scheme', 'policy', 'pmkisan', 'pmfby', 'insurance']):
        return "policy"
    elif any(keyword in query_lower for keyword in ['pest', 'disease', 'chemical', 'pesticide', 'treatment']):
        return "chem_reco"
    elif "image shows:" in query_lower:
        return "vision"
    else:
        return "general"

def _analyze_image_stub(filename: str) -> tuple[str, float]:
    """Stub for image analysis - replace with actual model"""
    # TODO: Replace with actual computer vision model
    # This is a placeholder that returns random agricultural labels
    
    import random
    
    labels = [
        ("Leaf blight", 0.45),
        ("Pest damage", 0.60),
        ("Nutrient deficiency", 0.55),
        ("Healthy crop", 0.80),
        ("Fungal infection", 0.40),
        ("Bacterial spot", 0.35)
    ]
    
    return random.choice(labels)

async def _log_query(user_id: str, question: str, agent: str, response: Dict[str, Any]) -> None:
    """Log query for audit and analysis"""
    try:
        query = """
        INSERT INTO queries (user_id, question, agent, response, confidence, flagged)
        VALUES ($1, $2, $3, $4, $5, $6)
        """
        
        confidence = response.get('confidence', 0.0)
        flagged = confidence < 0.6  # Flag low confidence responses
        
        await db.execute(query, user_id, question, agent, response, confidence, flagged)
        
    except Exception as e:
        print(f"Query logging error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)