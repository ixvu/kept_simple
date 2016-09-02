import codecs
import json

from authomatic.adapters import WebObAdapter
from kiss.models.users import User
from pyramid.httpexceptions import HTTPFound
from pyramid.security import remember, forget
from pyramid.view import view_config

from ..authomaic_config import authomatic

conn_err_msg = """\
Pyramid is having a problem using your SQL database.  The problem
might be caused by one of the following things:

1.  You may need to run the "initialize_kiss_db" script
    to initialize your database tables.  Check your virtual
    environment's "bin" directory for this script and try to run it.

2.  Your database server may not be running.  Check that the
    database server referred to by the "sqlalchemy.url" setting in
    your "development.ini" file is running.

After you fix the problem, please restart the Pyramid application to
try it again.
"""


@view_config(route_name='home', renderer='templates/verify.html.jinja2')
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
