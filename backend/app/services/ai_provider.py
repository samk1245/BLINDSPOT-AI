import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

class AIProvider:
    """
    Unified AI Provider Interface with Google Gemini API and
    Deterministic Epistemic Heuristics Fallback Engine.
    """

    def generate_json_sync(self, prompt: str, system_instruction: str) -> Dict[str, Any]:
        return self._heuristic_fallback(prompt, system_instruction)

    async def generate_json(self, prompt: str, system_instruction: str) -> Dict[str, Any]:
        if settings.GEMINI_API_KEY and settings.AI_PROVIDER == "gemini":
            try:
                result = await self._call_gemini_api(prompt, system_instruction)
                if result:
                    return result
            except Exception as e:
                logger.warning(f"Gemini API call failed, falling back to heuristics engine: {str(e)}")

        return self.generate_json_sync(prompt, system_instruction)

    async def _call_gemini_api(self, prompt: str, system_instruction: str) -> Optional[Dict[str, Any]]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": f"{system_instruction}\n\nTask:\n{prompt}"}]}
            ],
            "generationConfig": {
                "temperature": 0.2,
                "response_mime_type": "application/json"
            }
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text)
            else:
                logger.error(f"Gemini API error {resp.status_code}: {resp.text}")
                return None

    def _heuristic_fallback(self, prompt: str, system_instruction: str) -> Dict[str, Any]:
        prompt_lower = prompt.lower()

        if "decompose" in system_instruction.lower() or "requirements" in system_instruction.lower():
            is_scholarship = any(k in prompt_lower for k in ["scholarship", "grant", "financial aid", "fellowship"])
            if is_scholarship:
                return {
                    "requirements": [
                        {
                            "category": "ELIGIBILITY",
                            "description": "Student residency, citizenship, and academic GPA requirements.",
                            "importance": "CRITICAL",
                            "expected_evidence": "Official policy statement defining minimum GPA and resident criteria.",
                            "verification_criteria": "Requires confirmation of exact GPA scale and acceptable states/citizenship."
                        },
                        {
                            "category": "FINANCIAL",
                            "description": "Household income ceiling and financial need qualification thresholds.",
                            "importance": "CRITICAL",
                            "expected_evidence": "Specific numerical income limits (e.g. gross annual income table).",
                            "verification_criteria": "Clear dollar threshold with definition of taxable vs gross family income."
                        },
                        {
                            "category": "DEADLINES",
                            "description": "Annual application cutoff date and submission window for incoming cycle.",
                            "importance": "CRITICAL",
                            "expected_evidence": "Explicit submission deadline date for the upcoming academic year.",
                            "verification_criteria": "Active deadline explicitly mentioning current academic year."
                        },
                        {
                            "category": "DOCUMENTATION",
                            "description": "Mandatory supporting documents (tax transcripts, letters of recommendation).",
                            "importance": "HIGH",
                            "expected_evidence": "Official checklist of certified forms and acceptable file formats.",
                            "verification_criteria": "Itemized list of required affidavits, identity proofs, and tax forms."
                        },
                        {
                            "category": "PROCEDURES",
                            "description": "Official application portal, verification steps, and submission workflow.",
                            "importance": "HIGH",
                            "expected_evidence": "Direct .gov or authorized university portal URL.",
                            "verification_criteria": "Authenticated portal link with step-by-step submission guide."
                        },
                        {
                            "category": "EXCEPTIONS",
                            "description": "Multi-year renewal conditions, minimum credit hours, and probation policies.",
                            "importance": "CRITICAL",
                            "expected_evidence": "Documented clause explaining conditions to retain or renew funding.",
                            "verification_criteria": "Explicit semester credit hour minimums and grade retention standards."
                        }
                    ]
                }
            else:
                return {
                    "requirements": [
                        {
                            "category": "ELIGIBILITY",
                            "description": f"Core prerequisites and baseline eligibility criteria for {prompt[:50]}.",
                            "importance": "CRITICAL",
                            "expected_evidence": "Official definition of qualified candidates or participating entities.",
                            "verification_criteria": "Explicit statutory or organizational eligibility terms."
                        },
                        {
                            "category": "DEADLINES",
                            "description": "Current effective dates, filing deadlines, or active regulatory periods.",
                            "importance": "CRITICAL",
                            "expected_evidence": "Calendar dates and explicit cutoff timeframes.",
                            "verification_criteria": "Confirmed active deadline referencing current operating cycle."
                        },
                        {
                            "category": "DOCUMENTATION",
                            "description": "Required filings, compliance records, or primary supporting evidence.",
                            "importance": "HIGH",
                            "expected_evidence": "Formal checklist of required proofs or filings.",
                            "verification_criteria": "Authorized documentation list from verified publisher."
                        },
                        {
                            "category": "EXCEPTIONS",
                            "description": "Key carve-outs, non-compliance penalties, and conditional exemptions.",
                            "importance": "HIGH",
                            "expected_evidence": "Specific statutory or procedural exception clauses.",
                            "verification_criteria": "Documented terms governing exemptions or forfeiture."
                        }
                    ]
                }

        return {"status": "success", "data": {}}

ai_provider = AIProvider()
