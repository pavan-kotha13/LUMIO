import json
import urllib.request
import sys

def test_score_engine():
    req = urllib.request.Request(
        'http://127.0.0.1:3000/api/score-engine/analyze',
        data=json.dumps({
            'resumeText': 'Marcus Vance Senior Distributed Systems Engineer with 8 years building distributed storage engines in Go, Rust, Raft, Kubernetes, gRPC, and PostgreSQL.',
            'jobDescription': 'Seeking Senior Backend Distributed Systems Engineer proficient in Go, Rust, Raft consensus, Kubernetes, and gRPC.'
        }).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print(f"Overall Score: {data.get('overallScore')}")
        print(f"Score Grade: {data.get('scoreGrade')}")
        print("Categories:")
        categories = data.get('categories', [])
        total_weight = 0
        if isinstance(categories, list):
            for cat in categories:
                name = cat.get('name')
                w = cat.get('weight', 0)
                s = cat.get('score', 0)
                total_weight += w
                print(f"  - {name}: {s}% (Weight: {w}%)")
        elif isinstance(categories, dict):
            for name, details in categories.items():
                w = details.get('weight', 0)
                s = details.get('score', 0)
                total_weight += w
                print(f"  - {name}: {s}% (Weight: {w}%)")
        print(f"Total Weight Sum: {round(total_weight, 2)}")
        assert round(total_weight, 2) in (1.0, 100.0), f"Expected 1.0 or 100.0 weight sum, got {total_weight}"
        print("Score Engine HTTP test passed successfully!")

def test_fastapi_direct():
    req = urllib.request.Request('http://127.0.0.1:8001/api/health')
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print("FastAPI Health Response:", data)
        assert data.get('status') == 'healthy'
        print("FastAPI direct health check passed!")

def test_proxy_auth_health():
    # Test PDF export through Express proxy
    pdf_req = urllib.request.Request('http://127.0.0.1:3000/api/resumes/export/pdf',
        data=json.dumps({
            'title': 'Test Resume',
            'personalInfo': {'fullName': 'Marcus Vance', 'email': 'marcus@example.com'},
            'sections': [
                {'title': 'Experience', 'content': 'Senior Distributed Systems Engineer'}
            ]
        }).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(pdf_req) as resp:
        content = resp.read()
        print(f"PDF Export status: {resp.status}, size: {len(content)} bytes, header: {content[:4]}")
        assert content.startswith(b"%PDF"), "Generated file does not have PDF magic bytes!"
        print("Proxy PDF Export test passed!")

    # Test DOCX export through Express proxy
    docx_req = urllib.request.Request('http://127.0.0.1:3000/api/resumes/export/docx',
        data=json.dumps({
            'title': 'Test Resume DOCX',
            'personalInfo': {'fullName': 'Marcus Vance', 'email': 'marcus@example.com'},
            'experience': [
                {'company': 'Distributed Cloud Corp', 'role': 'Lead Engineer', 'bulletPoints': ['Architected Raft clustering engine']}
            ]
        }).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(docx_req) as resp:
        content = resp.read()
        print(f"DOCX Export status: {resp.status}, size: {len(content)} bytes, header: {content[:4]}")
        assert content.startswith(b"PK"), "Generated file does not have ZIP/DOCX magic bytes (PK)!"
        print("Proxy DOCX Export test passed!")

if __name__ == '__main__':
    print("Testing Express & FastAPI endpoints...")
    test_fastapi_direct()
    test_score_engine()
    test_proxy_auth_health()
    print("ALL ENDPOINT INTEGRATION TESTS PASSED!")
