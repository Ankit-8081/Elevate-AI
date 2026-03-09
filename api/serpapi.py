import requests
import os
import json

def get_serp_jobs(title=None, location=None, latest_only=False):
    api_key = os.environ.get("SERPAPI_KEY") # Replace with your key if not using env
    
    if not api_key:
        return {"error": "Missing SERPAPI_KEY"}

    # 1. FIX: Google Jobs works better with quoted titles for exact matches
    # And we ensure a fallback global location if none is provided
    search_query = f'"{title}"' if title else ""
    search_location = location if location else "United States" # Default fallback

    params = {
        "engine": "google_jobs",
        "q": search_query,
        "location": search_location,
        "api_key": api_key,
        "hl": "en",
        "gl": "us" # Set to 'in' for India, 'us' for USA
    }

    # 2. ADD LATEST FILTER: Google uses 'chips' for time filtering
    # date_posted:today = Last 24 hours
    # date_posted:3days = Last 3 days
    if latest_only:
        params["chips"] = "date_posted:today"

    try:
        response = requests.get("https://serpapi.com/search.json", params=params, timeout=15)
        data = response.json()

        # Debug: Print the search URL to see if it works in a browser
        # print(f"DEBUG URL: {data.get('search_metadata', {}).get('google_jobs_url')}")

        if "error" in data:
            return {"error": data["error"], "jobs": []}

        jobs_results = data.get("jobs_results", [])
        
        jobs = []
        for j in jobs_results:
            jobs.append({
                "id": j.get("job_id"),
                "title": j.get("title"),
                "company": j.get("company_name"),
                "location": j.get("location"),
                "posted_at": j.get("detected_extensions", {}).get("posted_at", "Recently"),
                "url": j.get("apply_options", [{}])[0].get("link", ""),
                "description": j.get("description")[:200] + "..." # Truncated for readability
            })

        return {"jobs": jobs, "count": len(jobs)}

    except Exception as e:
        return {"error": str(e)}

# --- TEST ---
if __name__ == "__main__":
    # Example: Finding AI Engineer jobs in Delhi posted TODAY
    print("Searching for LATEST AI Engineer jobs in Mumbai...")
    result = get_serp_jobs(title="AI Engineer", location="Mumbai")
    
    if result.get("jobs"):
        print(f"Found {result['count']} jobs!")
        print(json.dumps(result["jobs"][0], indent=2)) # Print first job
    else:
        print("Still 0 jobs. Try removing 'latest_only' or checking your API key quota.")