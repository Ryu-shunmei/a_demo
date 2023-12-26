from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from configs import app_settings
from providers import psql_provider, logger_provider

from app.endpoints.master import master_router
from app.endpoints.auth import auth_router
from app.endpoints.banks import banks_router
from app.endpoints.orgs import org_router
from app.endpoints.users import users_router
from app.endpoints.cases import cases_router

# スタートアップ前のイベント


@asynccontextmanager
async def lifespan(app: FastAPI):
    # グローバルログの初期化
    await logger_provider.register()
    # データベースプールの初期化
    await psql_provider.register()
    yield


# アプリ設定
app = FastAPI(
    title=app_settings.NAME,
    docs_url=app_settings.DOCS,
    openapi_url=app_settings.OPENAPI,
    lifespan=lifespan,
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ROUTER追加
app.include_router(auth_router, prefix="/api")
app.include_router(master_router, prefix="/api")
app.include_router(banks_router, prefix="/api")
app.include_router(org_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(cases_router, prefix="/api")

if __name__ == "__main__":
    from uvicorn import run

    run(app="main:app", host="0.0.0.0", port=8000, reload=True)
