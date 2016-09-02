from sqlalchemy import (
    Column,
    String,
    Integer,
)

from . import Base


class ClassificationData(Base):
    __tablename__ = "classification_data"
    id = Column(Integer, primary_key=True)
    pentos_id = Column(Integer)
    question = Column(String)
    title = Column(String)
    url = Column(String)
    breadcrumb = Column(String)
    categorypath1 = Column(String)
    categorypath2 = Column(String)
    imageurl = Column(String)
    categorypath1_error_level = Column(String)
    categorypath2_error_level = Column(String)
    answer = Column(String)
    job_id = Column(Integer)
