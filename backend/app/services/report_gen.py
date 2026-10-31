import json
import datetime
from typing import Dict, Any, List
from app.models.investigation import Investigation, ResearchRequirement
from app.models.source import Source
from app.models.intelligence import InformationGap, Conflict, VerificationTask

def generate_investigation_report_data(
    investigation: Investigation,
    requirements: List[ResearchRequirement],
    sources: List[Source],
    gaps: List[InformationGap],
    conflicts: List[Conflict],
    tasks: List[VerificationTask],
    readiness: Dict[str, Any]
) -> Dict[str, Any]:
    return {
        "investigation_id": investigation.id,
        "title": investigation.title,
        "research_question": investigation.research_question,
        "objective": investigation.objective,
        "domain": investigation.domain,
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "readiness_index": readiness,
        "requirements": [
            {
                "category": r.category.value,
                "description": r.description,
                "importance": r.importance.value,
                "coverage_status": r.coverage_status.value,
                "expected_evidence": r.expected_evidence
            } for r in requirements
        ],
        "sources_reviewed": [
            {
                "title": s.title,
                "type": s.source_type.value,
                "url": s.url,
                "publication_date": s.publication_date or "Unspecified",
                "content_hash": s.content_hash,
                "reliability_score": s.reliability_score
            } for s in sources
        ],
        "information_gaps": [
            {
                "title": g.gap_title,
                "category": g.category,
                "classification": g.classification.value,
                "impact": g.impact_level,
                "description": g.description,
                "suggested_action": g.suggested_action,
                "epistemic_note": g.epistemic_note
            } for g in gaps
        ],
        "cross_source_conflicts": [
            {
                "claim_a": c.claim_a_text,
                "claim_b": c.claim_b_text,
                "source_a": c.source_a_title,
                "source_b": c.source_b_title,
                "type": c.conflict_type.value,
                "difference_explanation": c.difference_explanation,
                "priority": c.priority.value,
                "resolution_guidance": c.resolution_guidance
            } for c in conflicts
        ],
        "verification_checklist": [
            {
                "task": t.title,
                "priority": t.priority.value,
                "reason": t.reason_it_matters,
                "source": t.suggested_official_source,
                "completed": t.is_completed
            } for t in tasks
        ]
    }

def generate_styled_html_report(data: Dict[str, Any]) -> str:
    readiness = data.get("readiness_index", {})
    score = readiness.get("score", 0.0)
    band = readiness.get("band", "UNKNOWN").replace("_", " ")

    req_rows = "".join([
        f"<tr><td><b>{r['category']}</b></td><td>{r['description']}</td><td><span class='badge badge-{r['coverage_status'].lower()}'>{r['coverage_status']}</span></td></tr>"
        for r in data.get("requirements", [])
    ])

    gap_cards = "".join([
        f"<div class='card gap-card'><h4>{g['title']} <span class='badge badge-{g['classification'].lower()}'>{g['classification']}</span></h4><p>{g['description']}</p><p class='meta'><b>Epistemic Note:</b> {g['epistemic_note']}</p><p class='action'><b>Action:</b> {g['suggested_action']}</p></div>"
        for g in data.get("information_gaps", [])
    ])

    conflict_cards = "".join([
        f"<div class='card conflict-card'><h4>Conflict: {c['source_a']} vs {c['source_b']} ({c['type']})</h4><div class='dual-claim'><div><b>Claim A:</b> {c['claim_a']}</div><div><b>Claim B:</b> {c['claim_b']}</div></div><p><b>Divergence:</b> {c['difference_explanation']}</p><p><b>Resolution Guidance:</b> {c['resolution_guidance']}</p></div>"
        for c in data.get("cross_source_conflicts", [])
    ])

    task_rows = "".join([
        f"<tr><td>{'[x]' if t['completed'] else '[ ]'}</td><td><b>{t['task']}</b></td><td>{t['priority']}</td><td>{t['source']}</td></tr>"
        for t in data.get("verification_checklist", [])
    ])

    sources_rows = "".join([
        f"<tr><td><b>{s['title']}</b></td><td>{s['type']}</td><td>{s['url'] or 'Uploaded PDF'}</td><td>{s['publication_date']}</td><td><code>{s['content_hash'][:12]}...</code></td></tr>"
        for s in data.get("sources_reviewed", [])
    ])

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>BLINDSPOT AI — Executive Intelligence Report</title>
<style>
  body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #e2e8f0; margin: 0; padding: 40px; }}
  .container {{ max-width: 900px; margin: 0 auto; background: #131b2e; border: 1px solid #1e293b; border-radius: 12px; padding: 32px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }}
  h1 {{ color: #38bdf8; font-size: 26px; border-bottom: 2px solid #1e293b; padding-bottom: 12px; margin-top: 0; }}
  h2 {{ color: #a855f7; font-size: 18px; margin-top: 28px; border-left: 4px solid #38bdf8; padding-left: 10px; }}
  p.meta {{ color: #94a3b8; font-size: 13px; }}
  .score-box {{ display: flex; align-items: center; justify-content: space-between; background: #1e293b; border-radius: 8px; padding: 16px 24px; margin: 20px 0; }}
  .score-num {{ font-size: 40px; font-weight: 800; color: #38bdf8; }}
  table {{ width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 14px; }}
  th, td {{ text-align: left; padding: 10px; border-bottom: 1px solid #1e293b; }}
  th {{ background: #0f172a; color: #94a3b8; }}
  .card {{ background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 14px; font-size: 14px; }}
  .gap-card {{ border-left: 4px solid #f59e0b; }}
  .conflict-card {{ border-left: 4px solid #ef4444; }}
  .badge {{ display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }}
  .badge-supported {{ background: #065f46; color: #34d399; }}
  .badge-partially_supported {{ background: #78350f; color: #fbbf24; }}
  .badge-missing {{ background: #7f1d1d; color: #f87171; }}
  .badge-conflicting {{ background: #831843; color: #f472b6; }}
  .dual-claim {{ background: #131b2e; padding: 10px; border-radius: 6px; margin: 8px 0; }}
  code {{ font-family: monospace; color: #38bdf8; }}
  @media print {{ body {{ background: #fff; color: #000; padding: 0; }} .container {{ border: none; box-shadow: none; }} }}
</style>
</head>
<body>
<div class="container">
  <h1>BLINDSPOT AI — Executive Intelligence Report</h1>
  <p class="meta"><b>Investigation:</b> {data['title']} | <b>Domain:</b> {data['domain']} | <b>Generated:</b> {data['generated_at']}</p>
  
  <div class="score-box">
    <div>
      <div style="font-size: 13px; text-transform: uppercase; color: #94a3b8;">Decision Readiness Index</div>
      <div style="font-size: 15px; font-weight: 600; color: #f1f5f9;">{band}</div>
    </div>
    <div class="score-num">{score}<span style="font-size: 20px; color: #94a3b8;">/100</span></div>
  </div>

  <h2>1. Research Objective & Central Question</h2>
  <p><b>Question:</b> {data['research_question']}</p>
  <p><b>Objective:</b> {data['objective']}</p>

  <h2>2. Research Requirements Coverage</h2>
  <table>
    <thead><tr><th>Category</th><th>Requirement Description</th><th>Status</th></tr></thead>
    <tbody>{req_rows}</tbody>
  </table>

  <h2>3. Detected Information Gaps & Epistemic Blindspots</h2>
  {gap_cards if gap_cards else "<p>No significant gaps discovered.</p>"}

  <h2>4. Cross-Source Contradiction Intelligence</h2>
  {conflict_cards if conflict_cards else "<p>No factual contradictions identified across sources.</p>"}

  <h2>5. Actionable Verification Checklist</h2>
  <table>
    <thead><tr><th>Status</th><th>Verification Task</th><th>Priority</th><th>Suggested Official Source</th></tr></thead>
    <tbody>{task_rows}</tbody>
  </table>

  <h2>6. Sources & Provenance Record</h2>
  <table>
    <thead><tr><th>Title</th><th>Type</th><th>Location</th><th>Date</th><th>Fingerprint</th></tr></thead>
    <tbody>{sources_rows}</tbody>
  </table>
</div>
</body>
</html>"""
