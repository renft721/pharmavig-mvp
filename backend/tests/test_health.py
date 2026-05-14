"""Health check tests"""

def test_health_check(client):
    """Test that health check endpoint returns ok status"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["ok", "degraded"]
    assert data["version"] == "1.0.0"
    assert "database" in data


def test_health_check_db_status(client):
    """Test that health check includes database status"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    # In test environment, database should be ok (SQLite in-memory)
    assert data["database"] == "ok"
