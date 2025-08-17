"""
Chemical recommendation service for FarmGuru - provides safe, conservative recommendations.
SAFETY: Never provides specific dosages or prescriptive application guidance.
"""
from typing import Dict, Any, List, Optional
from .db import db
from .retriever import retriever

class ChemRecommendationService:
    def __init__(self):
        # Safe IPM recommendations by symptom category
        self.ipm_recommendations = {
            "leaf_spots": {
                "recommendation": "Suspected foliar fungal infection. Follow IPM: remove severely affected leaves, use neem-based biopesticide or consult KVK for certified fungicide. Do not apply chemicals without expert verification.",
                "confidence": 0.35,
                "next_steps": ["Remove affected plant parts", "Use neem oil spray", "Consult local KVK expert"]
            },
            "yellowing": {
                "recommendation": "Possible nutrient deficiency or root problems. Check soil pH and drainage. Apply organic compost and consult agricultural expert for soil testing.",
                "confidence": 0.40,
                "next_steps": ["Check soil moisture", "Test soil pH", "Apply organic matter", "Consult extension officer"]
            },
            "wilting": {
                "recommendation": "Possible water stress or root rot. Check irrigation schedule and soil drainage. Avoid overwatering. Consult expert if symptoms persist.",
                "confidence": 0.45,
                "next_steps": ["Check soil moisture", "Improve drainage", "Adjust irrigation", "Monitor plant recovery"]
            },
            "pest_damage": {
                "recommendation": "Visible pest damage detected. Use IPM approach: manual removal of pests, neem oil application, and beneficial insect conservation. Consult KVK for pest identification.",
                "confidence": 0.50,
                "next_steps": ["Identify pest species", "Manual pest removal", "Use sticky traps", "Consult pest management expert"]
            },
            "general": {
                "recommendation": "Plant health issue detected. Recommend comprehensive crop assessment by local agricultural extension officer. Follow integrated crop management practices.",
                "confidence": 0.30,
                "next_steps": ["Contact local KVK", "Document symptoms", "Get professional diagnosis"]
            }
        }
        
    async def get_recommendation(self, crop: str, symptom: str, image_id: Optional[str], user_id: Optional[str]) -> Dict[str, Any]:
        """Get safe chemical/treatment recommendation"""
        try:
            # Determine symptom category
            symptom_category = self._categorize_symptom(symptom)
            
            # Get base recommendation
            base_reco = self.ipm_recommendations.get(symptom_category, self.ipm_recommendations["general"])
            
            # Retrieve relevant agricultural documents
            query_text = f"{crop} {symptom} disease management IPM"
            docs = await retriever.retrieve_docs(query_text, limit=2)
            
            # Format sources
            sources = []
            for doc in docs:
                sources.append({
                    "title": doc.get('title', 'Agricultural Guide'),
                    "url": doc.get('source_url', '#'),
                    "snippet": doc.get('content', '')[:150]
                })
                
            # Log the recommendation request
            if user_id:
                await self._log_recommendation(user_id, crop, symptom, image_id, base_reco)
                
            return {
                "recommendation": base_reco["recommendation"],
                "confidence": base_reco["confidence"],
                "sources": sources,
                "next_steps": base_reco["next_steps"],
                "safety_notice": "IMPORTANT: This is general guidance only. Always consult local agricultural experts before applying any treatments.",
                "meta": {
                    "crop": crop,
                    "symptom_category": symptom_category,
                    "image_id": image_id
                }
            }
            
        except Exception as e:
            print(f"Chemical recommendation error: {e}")
            return await self._get_fallback_recommendation(crop, symptom)
            
    def _categorize_symptom(self, symptom: str) -> str:
        """Categorize symptom into broad categories for safe recommendations"""
        symptom_lower = symptom.lower()
        
        spot_keywords = ['spot', 'spots', 'lesion', 'blotch', 'blight', 'rust']
        yellowing_keywords = ['yellow', 'yellowing', 'chlorosis', 'pale']
        wilting_keywords = ['wilt', 'wilting', 'droop', 'drooping']
        pest_keywords = ['pest', 'insect', 'bug', 'caterpillar', 'aphid', 'mite']
        
        if any(keyword in symptom_lower for keyword in spot_keywords):
            return "leaf_spots"
        elif any(keyword in symptom_lower for keyword in yellowing_keywords):
            return "yellowing"
        elif any(keyword in symptom_lower for keyword in wilting_keywords):
            return "wilting"
        elif any(keyword in symptom_lower for keyword in pest_keywords):
            return "pest_damage"
        else:
            return "general"
            
    async def _log_recommendation(self, user_id: str, crop: str, symptom: str, image_id: Optional[str], recommendation: Dict[str, Any]) -> None:
        """Log the recommendation for audit purposes"""
        try:
            query = """
            INSERT INTO queries (user_id, question, agent, response, confidence)
            VALUES ($1, $2, $3, $4, $5)
            """
            
            question = f"Chemical recommendation for {crop}: {symptom}"
            response_data = {
                "recommendation": recommendation["recommendation"],
                "image_id": image_id,
                "type": "chemical_recommendation"
            }
            
            await db.execute(query, user_id, question, "chem_reco", response_data, recommendation["confidence"])
            
        except Exception as e:
            print(f"Recommendation logging error: {e}")
            
    async def _get_fallback_recommendation(self, crop: str, symptom: str) -> Dict[str, Any]:
        """Fallback recommendation when service fails"""
        return {
            "recommendation": "Unable to provide specific recommendation. Please consult your local KVK (Krishi Vigyan Kendra) or agricultural extension officer for proper diagnosis and treatment guidance.",
            "confidence": 0.0,
            "sources": [],
            "next_steps": [
                "Contact local KVK",
                "Get professional plant diagnosis",
                "Follow IPM practices",
                "Document symptoms clearly"
            ],
            "safety_notice": "IMPORTANT: Never apply chemical treatments without expert consultation.",
            "meta": {
                "crop": crop,
                "symptom_category": "unknown",
                "image_id": None
            }
        }

# Global chemical recommendation service instance
chem_reco_service = ChemRecommendationService()