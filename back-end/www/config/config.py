from pathlib import Path
from os.path import abspath, join, dirname


secret_dir = abspath(join(dirname( __file__ ), "..", "..", "secret"))


class Config(object):
    DEBUG = False
    TESTING = False
    CSRF_ENABLED = True
    SQLALCHEMY_DATABASE_URI = Path(join(secret_dir, "db_url_staging")).read_text().strip()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UNSPLASH_ACCESS_KEY = Path(join(secret_dir, "unsplash_access_key_staging")).read_text().strip()
    GOOGLE_SIGNIN_CLIENT_ID = Path(join(secret_dir, "google_signin_client_id_staging")).read_text().strip()
    JWT_PRIVATE_KEY = Path(join(secret_dir, "private_key")).read_text().strip()


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = Path(join(secret_dir, "db_url_production")).read_text().strip()
    UNSPLASH_ACCESS_KEY = Path(join(secret_dir, "unsplash_access_key_production")).read_text().strip()
    GOOGLE_SIGNIN_CLIENT_ID = Path(join(secret_dir, "google_signin_client_id_production")).read_text().strip()


class StagingConfig(Config):
    DEVELOPMENT = True
    DEBUG = True


class DevelopmentConfig(Config):
    DEVELOPMENT = True
    DEBUG = True


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = Path(join(secret_dir, "db_url_testing")).read_text().strip()


config = StagingConfig() # for staging
#config = ProductionConfig() # for production
