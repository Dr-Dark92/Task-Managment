from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.database import Base, engine, SessionLocal
from app.models import User

BASE_DIR = Path(__file__).resolve().parent.parent

app = FastAPI(title="Task Management", version="0.1.0")
app.mount("/static", StaticFiles(directory=BASE_DIR / "web" / "static"), name="static")
templates = Jinja2Templates(directory=BASE_DIR / "web" / "templates")


@app.on_event("startup")
def startup() -> None:
    (BASE_DIR / "data").mkdir(exist_ok=True)
    (BASE_DIR / "storage").mkdir(exist_ok=True)
    Base.metadata.create_all(bind=engine)


def initialized() -> bool:
    with SessionLocal() as db:
        return db.query(User).count() > 0


@app.get("/", response_class=HTMLResponse)
def root(request: Request):
    if not initialized():
        return RedirectResponse("/setup", status_code=303)
    return RedirectResponse("/login", status_code=303)


@app.get("/setup", response_class=HTMLResponse)
def setup_page(request: Request):
    if initialized():
        return RedirectResponse("/login", status_code=303)
    return templates.TemplateResponse(request=request, name="setup.html", context={"title": "Initial Setup"})


@app.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    if not initialized():
        return RedirectResponse("/setup", status_code=303)
    return templates.TemplateResponse(request=request, name="login.html", context={"title": "Login"})


@app.get("/health")
def health():
    return {"status": "ok", "initialized": initialized()}
