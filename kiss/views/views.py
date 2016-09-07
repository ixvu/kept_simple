import codecs
import json

from authomatic.adapters import WebObAdapter
from kiss.models.users import User
from pyramid.httpexceptions import HTTPFound
from pyramid.security import remember, forget
from pyramid.view import view_config
from kiss.models import DBSession
from kiss.models.classification import ClassificationData
from ..authomaic_config import authomatic
from cornice import Service

feed = Service(name='feed', path='/feed', description='feed')


@feed.get()
def get_feed(request):
    data = []
    for rec in DBSession.query(ClassificationData).limit(10).all():
        product = {}
        product['url'] = rec.url
        product['title'] = rec.title
        product['breadcrumb'] = rec.breadcrumb
        product['categorypath1'] = rec.categorypath1
        product['categorypath2'] = rec.categorypath2
        product['pentos_id'] = rec.pentos_id
        data.append(product)
    return data

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
