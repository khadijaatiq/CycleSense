from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db     = client["CycleSense"]

users_collection  = db["users"]
cycles_collection = db["cycles"]

if __name__ == "__main__":
    try:
        client.admin.command("ping")
        print("MongoDB connection successful")
    except Exception as e:
        print(f"Connection failed: {e}")


