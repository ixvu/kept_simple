"""update Scrape status

Usage:
    update_scraped_data.py --input=<scraped_data_zip>
"""

from docopt import docopt
from zipfile import ZipFile
import re
import json
from kiss.models.classification import ClassificationData
from sqlalchemy import engine_from_config
from sqlalchemy.orm import sessionmaker
import configparser

import logging

FORMAT = '%(asctime)s %(levelname)s %(message)s'
logging.basicConfig(level=logging.DEBUG, format=FORMAT)
STATIC = '../static/spot_check_images/'


def get_engine():
    config = configparser.ConfigParser()
    config.read("../../development.ini")
    engine = engine_from_config(config["app:main"])
    return engine


def get_session(engine):
    Session = sessionmaker(bind=engine)
    session = Session()
    return session


if __name__ == '__main__':
    arguments = docopt(__doc__, version=__file__ + ': 0.1')
    logging.debug("The provided arguments are \n {}".format(arguments))
    input_file = arguments.get('--input')
    in_zip = ZipFile(input_file, 'r')
    session = get_session(get_engine())
    logging.debug("reading the zipfile.")
    for zipped_file in in_zip.namelist():
        if re.search(r'.*\.json', zipped_file):
            statuses = json.loads(in_zip.read(name=zipped_file).decode("utf-8"))
        elif re.search(r'.*\.png', zipped_file):
            image_data = in_zip.read(zipped_file)
            with open(STATIC + zipped_file, 'wb') as image_file:
                image_file.write(image_data)
    ids = [int(record) for record in statuses.keys()]
    classification_data = session.query(ClassificationData).filter(ClassificationData.id.in_(ids)).all()
    logging.debug("updating the status.")
    for item in classification_data:
        status = statuses.get(str(item.id))
        item.http_status = status
        session.merge(item)
    session.commit()
    logging.debug("updating scraped data completed")
