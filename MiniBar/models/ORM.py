from db.database import engine, Base
import models.all_models

def orm():
    print("Tables detected:", Base.metadata.tables.keys())

    Base.metadata.create_all(engine)

    print("Tables created")