import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure tests use in-memory SQLite
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app.core.database import Base
from app.api.deps import get_db
from app.main import app

engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def init_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_html():
    return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sample Test Article — Web Scraper Testing</title>
    <meta name="description" content="A comprehensive test fixture for scraping verification.">
    <meta name="keywords" content="test, scraper, python, beautifulsoup">
    <meta property="og:title" content="OpenGraph Test Title">
    <meta property="og:description" content="OG description test string.">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="canonical" href="https://example.com/test-article">
    <link rel="icon" href="/favicon.ico">
</head>
<body>
    <header>
        <h1>Main Article Heading H1</h1>
        <p>Contact support at <a href="mailto:support@example.com">support@example.com</a> or billing@testcorp.org.</p>
    </header>
    <main>
        <h2>Section Heading H2</h2>
        <p>This is the first clean paragraph of text extracted from the document body.</p>
        <p>Here is another paragraph containing helpful information and metrics.</p>
        
        <h3>Sub-section Heading H3</h3>
        <ul>
            <li><a href="/internal-page-1" rel="prev">Internal Link 1</a></li>
            <li><a href="https://external-domain.org/resource" target="_blank" rel="noopener">External Resource</a></li>
        </ul>

        <img src="/images/banner.png" alt="Test Banner Image" title="Banner Title" loading="lazy" width="800" height="400">
        <img src="https://external-cdn.com/logo.webp" alt="Logo">

        <table id="test-table">
            <thead>
                <tr>
                    <th>Item ID</th>
                    <th>Product Name</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>101</td>
                    <td>Web Scraper Pro</td>
                    <td>$49.00</td>
                </tr>
                <tr>
                    <td>102</td>
                    <td>Data Crawler Suite</td>
                    <td>$99.00</td>
                </tr>
            </tbody>
        </table>
    </main>
    <footer>
        <p>&copy; 2026 Test Organization. For inquiries write to admin@example.com.</p>
    </footer>
</body>
</html>"""
