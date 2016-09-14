import codecs
import json

from authomatic.adapters import WebObAdapter
from kiss.models.users import User
from pyramid.httpexceptions import HTTPFound
from pyramid.security import remember, forget
from pyramid.view import view_config
from kiss.models import DBSession
from kiss.models.classification import ClassificationData, UserAnnotation
from ..authomaic_config import authomatic
from cornice import Service
from datetime import datetime
from sqlalchemy import and_
from pyramid.httpexceptions import HTTPForbidden

feed = Service(name='feed', path='/feed', description='feed')
user_annotation = Service(name="annotate", path="/annotate", description="Api for storing user annotations")


def validate_user(request):
    user = User.get_user_from_auth_tkt(request.authenticated_userid)
    if not user:
        return HTTPForbidden({'status': 'error', 'message': 'login to continue'})
    return user


@feed.get()
def get_feed(request):
    data = []
    query = DBSession.query(ClassificationData)
    all_rows = request.params.get("all")
    if not all_rows:
        query = query.filter(ClassificationData.http_status != 404)
    for rec in query.all():
        product = {'url': rec.url, 'title': rec.title, 'breadcrumb': rec.breadcrumb, 'categorypath1': rec.categorypath1,
                   'categorypath2': rec.categorypath2, 'pentos_id': rec.pentos_id, 'id': rec.id, 'job_id': rec.job_id}
        data.append(product)
    return data


@user_annotation.get()
def get_user_annotation(request):
    user = validate_user(request)
    user_id = user.user_id
    record_id = int(request.GET.get("record_id"))

    annotations = []
    for annotation in DBSession.query(UserAnnotation).filter(and_(UserAnnotation.user_id == user_id,
                                                                  UserAnnotation.record_id == record_id)).all():
        annotations.append({'record_id': annotation.record_id, 'category_path_id': annotation.categorypath_id,
                            'annotation_id': annotation.annotation_id})
    return annotations


@user_annotation.post()
def annotate(request):
    user = validate_user(request)
    user_id = user.user_id
    category_path_id = int(request.POST.get("category_path_id"))
    record_id = int(request.POST.get("record_id"))
    annotation_id = int(request.POST.get("annotation_id"))
    created_date = datetime.now()

    annotation = DBSession.query(UserAnnotation).filter(
        and_(UserAnnotation.user_id == user_id, UserAnnotation.record_id == record_id,
             UserAnnotation.categorypath_id == category_path_id)).one_or_none()
    if annotation:
        annotation.annotation_id = annotation_id
        annotation.created_date = created_date
    else:
        annotation = UserAnnotation(
            user_id=user_id,
            categorypath_id=category_path_id,
            record_id=record_id,
            annotation_id=annotation_id,
            created_date=created_date
        )
    DBSession.merge(annotation)
    return {'status': 'success'}


@view_config(route_name='home', renderer='templates/index.html.jinja2')
def home_page(request):
    user = User.get_user_from_auth_tkt(request.authenticated_userid)
    return {'user': user}


@view_config(route_name='verify', renderer='templates/verify.html.jinja2')
def verify(request):
    return {'one': 1, 'project': 'kiss'}


@view_config(route_name='create', renderer='templates/create.html.jinja2')
def create(request):
    if request.method == 'POST':
        reader = codecs.getreader("utf-8")
        filename = request.POST['json-export'].filename
        input_file = request.POST['json-export'].file
        data = json.load(reader(input_file))
        size = len(data)
        return {'one': 1, 'project': 'kiss', 'name': filename, 'size': size}
    else:
        return {'one': 1, 'project': 'kiss'}


@view_config(route_name='google_login')
def google_login(request):
    """
    Login using Facebook and generate auth token

    :param request:
    :return:
    """

    response = HTTPFound(location=request.route_url('home'))
    provider_name = 'google'
    result = authomatic.login(WebObAdapter(request, response), provider_name)
    if result and result.user.credentials:
        # get fb authenticated user
        result.user.update()
        user = User.register_user(result.user.id, result.user.name, result.user.credentials.token,
                                  result.user.email)  # Generate auth token
        auth_tkt = User._get_auth_tkt(user)
        header = remember(request, auth_tkt)
        # Add auth token headers to response
        header_list = response._headerlist__get()
        [header_list.append(auth_header) for auth_header in header]
        response._headerlist__set(header_list)
    return response


@view_config(route_name='logout')
def logout(request):
    """
    Logout user and invalidate auth token
    :param request:
    :return:
    """
    headers = forget(request)
    auth_tkt = request.authenticated_userid
    User.expire_auth_tkt(auth_tkt)
    return HTTPFound(headers=headers, location=request.route_url("home_page"))
