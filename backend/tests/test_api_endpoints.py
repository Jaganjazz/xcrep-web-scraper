import pytest


def test_health_check(client):
    res = client.get("/api/health/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"


def test_validate_url_api(client):
    # Valid URL
    res = client.post("/api/scrape/validate-url", json={"url": "https://example.com"})
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is True
    assert data["normalized_url"] == "https://example.com"
    assert data["robots"] is not None

    # Invalid URL
    res2 = client.post("/api/scrape/validate-url", json={"url": "http://localhost:8000"})
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["valid"] is False
    assert "prohibited" in data2["error"].lower()


def test_scrapes_history_api(client):
    res = client.get("/api/scrapes/")
    assert res.status_code == 200
    data = res.json()
    assert "jobs" in data
    assert "total" in data


def test_export_endpoints(client):
    sample_payload = {
        "data": {
            "title": "API Export Test",
            "clean_text": "Sample text for testing exports.",
            "links": [{"text": "Home", "url": "https://example.com"}],
            "emails": ["test@example.com"],
        },
        "base_name": "api_test",
    }

    # CSV
    res_csv = client.post("/api/export/csv", json=sample_payload)
    assert res_csv.status_code == 200
    assert res_csv.json()["format"] == "csv"

    # JSON
    res_json = client.post("/api/export/json", json=sample_payload)
    assert res_json.status_code == 200
    assert res_json.json()["format"] == "json"

    # Excel
    res_xlsx = client.post("/api/export/excel", json=sample_payload)
    assert res_xlsx.status_code == 200
    assert res_xlsx.json()["format"] == "xlsx"

    # TXT
    res_txt = client.post("/api/export/txt", json=sample_payload)
    assert res_txt.status_code == 200
    assert res_txt.json()["format"] == "txt"

    # PDF
    res_pdf = client.post("/api/export/pdf", json=sample_payload)
    assert res_pdf.status_code == 200
    assert res_pdf.json()["format"] == "pdf"


def test_datasets_api(client):
    # Create dataset
    create_res = client.post(
        "/api/datasets/",
        json={"name": "API Created Dataset", "description": "From test", "tags": ["test"]},
    )
    assert create_res.status_code == 201
    dataset_id = create_res.json()["id"]

    # Get dataset
    get_res = client.get(f"/api/datasets/{dataset_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "API Created Dataset"

    # Delete dataset
    del_res = client.delete(f"/api/datasets/{dataset_id}")
    assert del_res.status_code == 204


def test_settings_api(client):
    get_res = client.get("/api/settings/")
    assert get_res.status_code == 200
    data = get_res.json()
    assert "user_agent" in data

    put_res = client.put("/api/settings/", json={"request_timeout_seconds": 22})
    assert put_res.status_code == 200
    assert put_res.json()["request_timeout_seconds"] == 22
