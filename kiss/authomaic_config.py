from authomatic import Authomatic
from authomatic.providers import oauth2
import authomatic


CONFIG = {
    'google': {

        'class_': oauth2.Google,
        'consumer_key': '498867530753-djd5cmhfhu62j242oqo3kvc06l6dmb06.apps.googleusercontent.com',
        'consumer_secret': '5WUX68oovxfuh_sa1JGKYyPx',
        'scope': oauth2.Google.user_info_scope,
         'id': authomatic.provider_id()
    }
}

authomatic = Authomatic(config=CONFIG, secret='some random secret string')
