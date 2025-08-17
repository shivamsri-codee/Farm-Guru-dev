"""
Policy matching service for FarmGuru - matches farmers with government schemes.
"""
from typing import Dict, Any, List, Optional
from .db import db

class PolicyMatcher:
    def __init__(self):
        pass
        
    async def match_policies(self, user_id: Optional[str], state: str, crop: str) -> Dict[str, Any]:
        """Match user with applicable government schemes"""
        try:
            # Get user profile if available
            user_profile = None
            if user_id:
                user_profile = await self._get_user_profile(user_id)
                
            # Find matching schemes
            schemes = await self._find_matching_schemes(state, crop)
            
            # Calculate overall confidence
            confidence = 0.9 if schemes else 0.1
            
            return {
                "matches": schemes,
                "confidence": confidence,
                "state": state,
                "crop": crop,
                "user_profile": user_profile
            }
            
        except Exception as e:
            print(f"Policy matching error: {e}")
            return await self._get_fallback_policies(state, crop)
            
    async def _get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile information"""
        try:
            query = "SELECT * FROM users WHERE id = $1"
            return await db.fetch_one(query, user_id)
        except Exception:
            return None
            
    async def _find_matching_schemes(self, state: str, crop: str) -> List[Dict[str, Any]]:
        """Find schemes matching the state and crop"""
        try:
            # Query schemes that match state and crop
            query = """
            SELECT code, name, description, url, applicable_states, applicable_crops
            FROM schemes
            WHERE ($1 = ANY(applicable_states) OR 'ALL' = ANY(applicable_states))
            AND ($2 = ANY(applicable_crops) OR 'ALL' = ANY(applicable_crops))
            ORDER BY name
            """
            
            schemes_data = await db.fetch_all(query, state, crop)
            
            # Format schemes with eligibility and required documents
            formatted_schemes = []
            for scheme in schemes_data:
                eligibility, required_docs = self._get_scheme_requirements(scheme['code'])
                
                formatted_schemes.append({
                    "scheme": scheme['name'],
                    "code": scheme['code'],
                    "description": scheme['description'],
                    "url": scheme['url'],
                    "eligibility": eligibility,
                    "required_docs": required_docs
                })
                
            return formatted_schemes
            
        except Exception as e:
            print(f"Scheme matching error: {e}")
            return []
            
    def _get_scheme_requirements(self, scheme_code: str) -> tuple[List[str], List[str]]:
        """Get eligibility criteria and required documents for a scheme"""
        scheme_requirements = {
            "PM-KISAN": {
                "eligibility": ["Small and marginal farmers", "Landholding up to 2 hectares", "Indian citizen"],
                "required_docs": ["Aadhaar card", "Land ownership documents", "Bank account details", "Mobile number"]
            },
            "PMFBY": {
                "eligibility": ["All farmers (loanee and non-loanee)", "Crop area should be insurable", "Premium payment required"],
                "required_docs": ["Aadhaar card", "Land records", "Sowing certificate", "Bank account details"]
            },
            "PKVY": {
                "eligibility": ["Farmers practicing organic farming", "Minimum 20 hectares cluster", "3-year conversion period"],
                "required_docs": ["Land documents", "Organic certification", "Group formation certificate"]
            },
            "KCC": {
                "eligibility": ["Farmers with cultivable land", "Good credit history", "Age 18-75 years"],
                "required_docs": ["Aadhaar card", "Land documents", "Income certificate", "Two passport photos"]
            }
        }
        
        requirements = scheme_requirements.get(scheme_code, {
            "eligibility": ["Eligible farmers", "As per scheme guidelines"],
            "required_docs": ["Required documents as per scheme"]
        })
        
        return requirements["eligibility"], requirements["required_docs"]
        
    async def _get_fallback_policies(self, state: str, crop: str) -> Dict[str, Any]:
        """Fallback policy data when database query fails"""
        fallback_schemes = [
            {
                "scheme": "PM-KISAN",
                "code": "PM-KISAN",
                "description": "Income support scheme providing ₹6000 per year to eligible farmers",
                "url": "https://pmkisan.gov.in",
                "eligibility": ["Small and marginal farmers", "Landholding up to 2 hectares"],
                "required_docs": ["Aadhaar card", "Land documents", "Bank account details"]
            },
            {
                "scheme": "Pradhan Mantri Fasal Bima Yojana",
                "code": "PMFBY",
                "description": "Crop insurance scheme protecting farmers from crop losses",
                "url": "https://pmfby.gov.in",
                "eligibility": ["All farmers", "Crop area should be insurable"],
                "required_docs": ["Aadhaar card", "Land records", "Sowing certificate"]
            }
        ]
        
        return {
            "matches": fallback_schemes,
            "confidence": 0.7,
            "state": state,
            "crop": crop,
            "user_profile": None
        }

# Global policy matcher instance
policy_matcher = PolicyMatcher()