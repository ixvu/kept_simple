from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    ForeignKey
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


class SpotCheckJob(Base):
    __tablename__ = "spot_checking_jobs"
    id = Column(Integer, primary_key=True)
    description = Column(String)


class Annotation(Base):
    __tablename__ = "annotations"
    id = Column(Integer, primary_key=True, autoincrement=False)
    description = Column(String)


class UserAnnotations(Base):
    __tablename__ = "user_annotations"
    user_id = Column(String(250), ForeignKey("users.user_id"), primary_key=True, nullable=False)
    record_id = Column(Integer, ForeignKey("classification_data.id"), primary_key=True, nullable=False)
    error_status_id = Column(Integer, ForeignKey("annotations.id"), primary_key=True, nullable=False)
    created_date = Column(DateTime)
