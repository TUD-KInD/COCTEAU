"""
Dump the schema of a database created by using sqlalchemy.

Code modified from:
    https://stackoverflow.com/questions/40619434/dump-postgresql-database-schema-with-python
You can visualize the schema by using:
    https://dbdiagram.io/
"""
import io
from sqlalchemy import create_mock_engine, create_engine, MetaData
from sqlalchemy.orm import sessionmaker
from config.config import Config


class SchemaDump(object):
    def __init__(self, db_url, schema_file_path):
        self.db_url = db_url
        self.schema_file_path = schema_file_path
        self.buf = io.BytesIO()

    def dump_shema(self):
        engine = create_engine(self.db_url)
        metadata = MetaData()
        metadata.reflect(engine)

        def dump(sql, *multiparams, **params):
            f = sql.compile(dialect=engine.dialect)
            self.buf.write(str(f).strip().encode())
            self.buf.write(str(';\n').encode())

        new_engine = create_mock_engine(self.db_url, executor=dump)
        metadata.create_all(new_engine, checkfirst=True)

        with io.open(self.schema_file_path, "wb+") as schema:
            schema.write(self.buf.getvalue())


sd = SchemaDump(Config.SQLALCHEMY_DATABASE_URI, "schema.sql")
sd.dump_shema()
print("Schema created at file 'schema.sql'")
