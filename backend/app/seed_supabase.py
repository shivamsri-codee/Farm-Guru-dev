"""
Seed script for populating Supabase database with initial data.
"""
import asyncio
import json
import csv
import os
from datetime import datetime, timedelta
from pathlib import Path
from .db import db
from .embeddings import embedding_service

class SupabaseSeeder:
    def __init__(self):
        self.data_dir = Path("data_samples")
        
    async def seed_all(self):
        """Seed all data into Supabase"""
        print("Starting Supabase seeding...")
        
        try:
            await db.connect()
            
            # Seed documents
            await self.seed_documents()
            
            # Seed weather data
            await self.seed_weather()
            
            # Seed market prices
            await self.seed_market_prices()
            
            # Seed schemes
            await self.seed_schemes()
            
            print("Seeding completed successfully!")
            
        except Exception as e:
            print(f"Seeding error: {e}")
        finally:
            await db.disconnect()
            
    async def seed_documents(self):
        """Seed agricultural documents with embeddings"""
        print("Seeding documents...")
        
        doc_files = [
            ("irrigation_guide.txt", "Irrigation Management Guide", "https://farmer.gov.in/irrigation"),
            ("pest_management.txt", "IPM Guide", "https://farmer.gov.in/ipm"),
            ("fertilizer_guide.txt", "Fertilizer Management", "https://farmer.gov.in/fertilizer"),
            ("pmkisan.txt", "PM-KISAN Scheme", "https://pmkisan.gov.in"),
            ("pmfby.txt", "PMFBY Crop Insurance", "https://pmfby.gov.in")
        ]
        
        for filename, title, url in doc_files:
            file_path = self.data_dir / filename
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                # Generate embedding
                embedding = await embedding_service.get_embedding(content)
                
                # Insert document
                query = """
                INSERT INTO docs (title, content, source_url, embedding)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (title) DO UPDATE SET 
                content = $2, source_url = $3, embedding = $4
                """
                
                await db.execute(query, title, content, url, embedding)
                print(f"Seeded document: {title}")
                
    async def seed_weather(self):
        """Seed weather data"""
        print("Seeding weather data...")
        
        weather_file = self.data_dir / "weather_sample.json"
        if weather_file.exists():
            with open(weather_file, 'r') as f:
                weather_data = json.load(f)
                
            for location, data in weather_data.items():
                state = "Karnataka"  # Default state
                district = location.capitalize()
                
                query = """
                INSERT INTO weather (state, district, forecast_date, json_payload)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (state, district, forecast_date) 
                DO UPDATE SET json_payload = $4
                """
                
                today = datetime.now().date()
                await db.execute(query, state, district, today, json.dumps(data))
                print(f"Seeded weather for {district}, {state}")
                
    async def seed_market_prices(self):
        """Seed market price data"""
        print("Seeding market prices...")
        
        market_file = self.data_dir / "market_sample.csv"
        if market_file.exists():
            with open(market_file, 'r') as f:
                reader = csv.DictReader(f)
                
                for row in reader:
                    query = """
                    INSERT INTO market_prices (commodity, mandi, date, modal_price)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (commodity, mandi, date) 
                    DO UPDATE SET modal_price = $4
                    """
                    
                    await db.execute(
                        query, 
                        row['commodity'], 
                        row['mandi'], 
                        row['date'], 
                        float(row['modal_price'])
                    )
                    
                print("Seeded market price data")
                
    async def seed_schemes(self):
        """Seed government schemes data"""
        print("Seeding schemes...")
        
        schemes_data = [
            {
                "code": "PM-KISAN",
                "name": "Pradhan Mantri Kisan Samman Nidhi",
                "description": "Income support scheme providing ₹6000 per year to eligible farmers",
                "applicable_states": ["ALL"],
                "applicable_crops": ["ALL"], 
                "url": "https://pmkisan.gov.in"
            },
            {
                "code": "PMFBY",
                "name": "Pradhan Mantri Fasal Bima Yojana",
                "description": "Crop insurance scheme protecting farmers from crop losses",
                "applicable_states": ["ALL"],
                "applicable_crops": ["rice", "wheat", "maize", "sugarcane", "cotton"],
                "url": "https://pmfby.gov.in"
            },
            {
                "code": "PKVY",
                "name": "Paramparagat Krishi Vikas Yojana",
                "description": "Organic farming promotion scheme",
                "applicable_states": ["ALL"],
                "applicable_crops": ["ALL"],
                "url": "https://pgsindia-ncof.gov.in"
            },
            {
                "code": "KCC",
                "name": "Kisan Credit Card",
                "description": "Credit facility for farmers to meet production credit needs",
                "applicable_states": ["ALL"],
                "applicable_crops": ["ALL"],
                "url": "https://pmkisan.gov.in/Kcc.aspx"
            }
        ]
        
        for scheme in schemes_data:
            query = """
            INSERT INTO schemes (code, name, description, applicable_states, applicable_crops, url)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (code) DO UPDATE SET 
            name = $2, description = $3, applicable_states = $4, applicable_crops = $5, url = $6
            """
            
            await db.execute(
                query,
                scheme["code"],
                scheme["name"], 
                scheme["description"],
                scheme["applicable_states"],
                scheme["applicable_crops"],
                scheme["url"]
            )
            
        print("Seeded schemes data")

async def main():
    """Main seeding function"""
    seeder = SupabaseSeeder()
    await seeder.seed_all()

if __name__ == "__main__":
    asyncio.run(main())