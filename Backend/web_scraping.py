import requests
from bs4 import BeautifulSoup
from urllib.parse import quote
from apify_client import ApifyClient
import os
from dotenv import load_dotenv
load_dotenv()
class JobScraper:
    """Base class for Job Scrapers to ensure consistent data structure."""
    
    def _format_job(self, title=None, location=None, description="", company=None, url=None):
        return {
            "title": title,
            "location": location,
            "description": description,
            "company": company,
            "url": url
        }

class LinkedInScraper(JobScraper):
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml"
        }

    def fetch_jobs(self, title="Software Engineer", location="United States"):
        encoded_title = quote(title)
        encoded_location = quote(location)
        list_url = f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords={encoded_title}&location={encoded_location}&start=0"
        
        response = requests.get(list_url, headers=self.headers)
        if response.status_code != 200:
            return {"error": f"Upstream {response.status_code}"}

        soup = BeautifulSoup(response.text, 'html.parser')
        jobs = []

        for li in soup.find_all("li"):
            title_el = li.find("a", href=lambda href: href and "/jobs/view/" in href)
            if not title_el:
                continue

            job_title = title_el.get_text(strip=True)
            job_url = title_el.get("href").split("?")[0]

            company_el = li.find(class_="base-search-card__subtitle")
            if not company_el:
                company_el = li.find("a", href=lambda href: href and "/company/" in href)
            
            company = company_el.get_text(strip=True) if company_el else None
            location_el = li.find(class_="job-search-card__location")
            location_text = location_el.get_text(strip=True) if location_el else None

            if job_title:
                # LinkedIn guest search doesn't provide full description in the list view
                jobs.append(self._format_job(
                    title=job_title,
                    location=location,
                    description="Visit URL for full description", 
                    company=company,
                    url=job_url
                ))
        return jobs

class NaukriScraper(JobScraper):
    def __init__(self):
        self.token = os.getenv("APIFY_API_KEY")
        self.client = ApifyClient(self.token) if self.token else None

    def fetch_jobs(self, query="software engineer", location="Bangalore", max_results=5):
        if not self.client:
            return {"error": "APIFY_TOKEN not configured"}

        try:
            run_input = {
                "query": query,
                "location": location,
                "max_results": int(max_results),
            }
            run = self.client.actor("muhammetakkurtt/naukri-job-scraper").call(run_input=run_input)
            dataset_items = self.client.dataset(run["defaultDatasetId"]).list_items().items

            jobs = []
            for j in dataset_items:
                jobs.append(self._format_job(
                    title=j.get("Job Title") or j.get("title"),
                    location=location,
                    description=f"Job Description: {j.get('jobDescription', '')[:300]}. Salary: {j.get('salary')}",
                    company=j.get("Company") or j.get("company"),
                    url=j.get("jdURL")
                ))
            return jobs
        except Exception as e:
            return {"error": str(e)}

class SerpApiScraper(JobScraper):
    def __init__(self):
        self.api_key = os.getenv("Serp_API_Key")

    def fetch_jobs(self, title="Software Engineer", location="United States"):
        query_string = f"{title or ''} {location or ''}".strip()
        url = f"https://serpapi.com/search.json?engine=google_jobs&q={quote(query_string)}&api_key={self.api_key}"

        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            raw_jobs = data.get("jobs_results", [])
            
            jobs = []
            for j in raw_jobs:
                apply_options = j.get("apply_options", [])
                apply_url = apply_options[0].get("link") if apply_options else ""

                jobs.append(self._format_job(
                    title=j.get("title"),
                    location=location,
                    description=j.get("description", "")[:300],
                    company=j.get("company_name"),
                    url=apply_url
                ))
            return jobs
        except Exception as e:
            return {"error": str(e)}

if __name__ == "__main__":
    li_scraper = LinkedInScraper()
    print("LinkedIn Results:", li_scraper.fetch_jobs("Developer", "New York"))
    nu_scraper = NaukriScraper()
    print("Naukri Scraper :" , nu_scraper.fetch_jobs("AI Engineering","Delhi"))
    serp_scraper = SerpApiScraper()
    print("SerpApi Results:", serp_scraper.fetch_jobs("Backend Developer", "Delhi"))