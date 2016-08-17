from sqlalchemy.orm import relationship

from . import Base, DBSession
from sqlalchemy import (
    Column,
    String,
    DateTime,
    ForeignKey
)
from datetime import datetime
import json


class User(Base):
    __tablename__ = 'users'

    user_id = Column(String(250), primary_key=True)
    user_email = Column(String(250))
    user_name = Column(String(250))
    access_token = Column(String(300))

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    def get_json(self):
        return json.dumps(self.as_dict())

    @staticmethod
    def register_user(user_id, user_name, access_token, user_email):
        user = DBSession.query(User).filter(User.user_id == user_id).first()
        # register user if not already registered
        if not user:
            user = User(user_id=user_id, user_name=user_name,
                        access_token=access_token, user_email=user_email)
            DBSession.add(user)

        return user

    @staticmethod
    def _get_auth_tkt(user):
        authenticated_user = DBSession.query(AuthenticatedUser).filter(
            AuthenticatedUser.user_id == user.user_id).first()
        # register user if not already registered
        if authenticated_user:
            auth_tkt = authenticated_user.auth_tkt
        else:
            random_string = str(int((datetime.now() - datetime.utcfromtimestamp(0)).total_seconds()))
            auth_tkt = str(user.user_id) + random_string
            user = AuthenticatedUser(auth_tkt=auth_tkt, user_id=int(user.user_id), last_active_time=datetime.utcnow())
            DBSession.add(user)
        # TODO: encrypt the id with a random salt to prevent misuse of id
        return auth_tkt

    @staticmethod
    def get_user_from_auth_tkt(auth_tkt):
        authenticated_user = DBSession.query(AuthenticatedUser).filter(AuthenticatedUser.auth_tkt == auth_tkt).first()
        if authenticated_user:
            authenticated_user.last_active_time = datetime.utcnow()
            return authenticated_user.user
        else:
            return None

    @staticmethod
    def expire_auth_tkt(auth_tkt):
        authenticated_user = DBSession.query(AuthenticatedUser).filter(AuthenticatedUser.auth_tkt == auth_tkt).first()
        if authenticated_user:
            DBSession.delete(authenticated_user)


class AuthenticatedUser(Base):
    __tablename__ = 'authenticated_users'

    auth_tkt = Column(String(200), primary_key=True)
    user_id = Column(ForeignKey('users.user_id'))
    last_active_time = Column(DateTime)

    user = relationship('User')
